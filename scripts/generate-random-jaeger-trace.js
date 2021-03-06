/**
 * Borrewed from:
 * https://github.com/jaegertracing/jaeger-ui/blob/378616f1720a3e5afd342d08b12eec2c03cdf1a4/packages/jaeger-ui/src/demo/trace-generators.js
 *
 * Usage:
 * `NUM_OF_SPANS=1000 NUM_OF_PROCESSES=2 node scripts/generate-random-jaeger-trace.js > 1000span-2process.json`
 */

const Chance = require('chance');

const chance = new Chance();

const SERVICE_LIST = [
  'serviceA',
  'serviceB',
  'serviceC',
  'serviceD',
  'serviceE',
  'serviceF',
];
const OPERATIONS_LIST = [
  'GET',
  'PUT',
  'POST',
  'DELETE',
  'MySQL::SELECT',
  'MySQL::INSERT',
  'MongoDB::find',
  'MongoDB::update',
];

function setupParentSpan(spans, parentSpanValues) {
  Object.assign(spans[0], parentSpanValues);
  return spans;
}

function getParentSpanId(span, levels) {
  let nestingLevel = chance.integer({ min: 1, max: levels.length });

  // pick the correct nesting level if allocated by the levels calculation
  levels.forEach((level, idx) => {
    if (level.indexOf(span.id) >= 0) {
      nestingLevel = idx;
    }
  });

  return nestingLevel - 1 >= 0
    ? chance.pickone(levels[nestingLevel - 1])
    : null;
}

/* this simulates the hierarchy created by CHILD_OF tags */
function attachReferences(spans) {
  const depth = chance.integer({ min: 1, max: 10 });
  let levels = [[spans[0].id]];

  const duplicateLevelFilter = (currentLevels) => (spanID) =>
    !currentLevels.find((level) => level.indexOf(spanID) >= 0);

  while (levels.length < depth) {
    const newLevel = chance
      .pickset(spans, chance.integer({ min: 4, max: 8 }))
      .map((s) => s.id)
      .filter(duplicateLevelFilter(levels));
    levels.push(newLevel);
  }

  // filter out empty levels
  levels = levels.filter((level) => level.length > 0);

  return spans.map((span) => {
    const parentSpanId = getParentSpanId(span, levels);
    return parentSpanId
      ? {
          ...span,
          references: [
            {
              refType: 'CHILD_OF',
              traceID: span.traceID,
              spanID: parentSpanId,
            },
          ],
        }
      : span;
  });
}

chance.mixin({
  trace({
    // long trace
    // very short trace
    // average case
    numberOfSpans = chance.pickone([
      Math.ceil(chance.normal({ mean: 200, dev: 10 })) + 1,
      Math.ceil(chance.integer({ min: 3, max: 10 })),
      Math.ceil(chance.normal({ mean: 45, dev: 15 })) + 1,
    ]),
    numberOfProcesses = chance.integer({ min: 1, max: 10 }),
  }) {
    const traceID = chance.guid();
    const duration = chance.integer({ min: 10000, max: 5000000 });
    const timestamp =
      (new Date().getTime() - chance.integer({ min: 0, max: 1000 }) * 1000) *
      1000;

    const processArray = chance.processes({ numberOfProcesses });
    const processes = processArray.reduce(
      (pMap, p) => ({ ...pMap, [p.processID]: p }),
      {}
    );

    let spans = chance.n(chance.span, numberOfSpans, {
      traceID,
      processes,
      traceStartTime: timestamp,
      traceEndTime: timestamp + duration,
    });
    spans = attachReferences(spans);
    if (spans.length > 1) {
      spans = setupParentSpan(spans, { startTime: timestamp, duration });
    }

    return {
      traceID,
      spans,
      processes,
    };
  },
  tag() {
    return {
      key: 'http.url',
      type: 'String',
      value: `/v2/${chance.pickone([
        'alpha',
        'beta',
        'gamma',
      ])}/${chance.guid()}`,
    };
  },
  span({
    traceID = chance.guid(),
    processes = {},
    traceStartTime = chance.timestamp() * 1000 * 1000,
    traceEndTime = traceStartTime + 100000,
    operations = OPERATIONS_LIST,
  }) {
    const startTime = chance.integer({
      min: traceStartTime,
      max: traceEndTime,
    });

    return {
      traceID,
      processID: chance.pickone(Object.keys(processes)),
      spanID: chance.guid(),
      flags: 0,
      operationName: chance.pickone(operations),
      references: [],
      startTime,
      duration: chance.integer({ min: 1, max: traceEndTime - startTime }),
      tags: chance.tags(),
      logs: [],
    };
  },
  process({ services = SERVICE_LIST }) {
    return {
      processID: chance.guid(),
      serviceName: chance.pickone(services),
      tags: chance.tags(),
    };
  },
  traces({ numberOfTraces = chance.integer({ min: 5, max: 15 }) }) {
    return chance.n(chance.trace, numberOfTraces, {});
  },
  tags() {
    return chance.n(chance.tag, chance.integer({ min: 1, max: 10 }), {});
  },
  processes({ numberOfProcesses = chance.integer({ min: 1, max: 25 }) }) {
    return chance.n(chance.process, numberOfProcesses, {});
  },
});

const trace = chance.trace({
  numberOfSpans:
    process.env.NUM_OF_SPANS ||
    chance.pickone([
      Math.ceil(chance.normal({ mean: 200, dev: 10 })) + 1,
      Math.ceil(chance.integer({ min: 3, max: 10 })),
      Math.ceil(chance.normal({ mean: 45, dev: 15 })) + 1,
    ]),
  numberOfProcesses:
    process.env.NUM_OF_PROCESSES || chance.integer({ min: 1, max: 10 }),
});
console.log(
  JSON.stringify(
    {
      data: [trace],
    },
    null,
    4
  )
);
