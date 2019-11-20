import './menu-list.css';
import MagnifySvgText from '!!raw-loader!@mdi/svg/svg/magnify.svg';
import PencilSvgText from '!!raw-loader!@mdi/svg/svg/pencil.svg';
import DeleteSvgText from '!!raw-loader!@mdi/svg/svg/delete.svg';
import CloseSvgText from '!!raw-loader!@mdi/svg/svg/close.svg';

export interface ToolbarMenuListOptions {
  width?: number;
  items: ToolbarMenuListItemOptions[];
  onButtonClick: (buttonId: string, index: number) => void;
  headerEl?: HTMLDivElement;
}

export interface ToolbarMenuListItemOptions {
  text: string;
  className?: string;
  buttons?: {
    id: string;
    icon: 'magnify' | 'pencil' | 'delete' | 'close';
  }[];
}

export interface ToolbarMenuListItem {
  options: ToolbarMenuListItemOptions;
  element: HTMLDivElement;
  onClickHandler?: (e: MouseEvent) => void;
}

export class ToolbarMenuList {
  readonly element = document.createElement('div');
  private items: ToolbarMenuListItem[] = [];

  constructor(private options: ToolbarMenuListOptions) {
    if (options.width) {
      this.element.style.width = `${options.width}px`;
    }

    options.headerEl && this.element.appendChild(options.headerEl);

    options.items.forEach(options => {
      this.addItem(options);
    });
  }

  getItems() {
    return this.items.slice();
  }

  addItem(options: ToolbarMenuListItemOptions) {
    const el = document.createElement('div');
    const item = { element: el, options };

    el.classList.add('toolbar-menu-list-item');

    const textEl = document.createElement('span');
    textEl.classList.add('text');
    textEl.textContent = options.text;
    el.appendChild(textEl);

    const buttonsContainer = document.createElement('div');
    el.appendChild(buttonsContainer);

    options.buttons.forEach(button => {
      const buttonEl = document.createElement('div');
      buttonEl.classList.add('button');
      buttonEl.innerHTML = {
        magnify: MagnifySvgText,
        pencil: PencilSvgText,
        delete: DeleteSvgText,
        close: CloseSvgText
      }[button.icon];
      buttonEl.setAttribute('data-menu-list-button-id', button.id);
      buttonsContainer.appendChild(buttonEl);
    });

    const onClickHandler = this.onItemClick.bind(this, item);
    el.addEventListener('click', onClickHandler, false);
    (item as any).onClickHandler = onClickHandler;

    this.element.appendChild(el);
    this.items.push(item);
  }

  removeItemAt(index: number) {
    if (index >= this.items.length) return false;
    const [removedItem] = this.items.splice(index, 1);
    if (removedItem) {
      this.element.removeChild(removedItem.element);
      if (removedItem.onClickHandler) {
        removedItem.element.removeEventListener(
          'click',
          removedItem.onClickHandler as any,
          false
        );
      }
    }
  }

  removeAllItems() {
    if (this.items.length == 0) return;
    let item = this.items[0];
    while (item) {
      this.removeItemAt(0);
      item = this.items[0];
    }
  }

  onItemClick(item: ToolbarMenuListItem, e: MouseEvent) {
    const index = this.items.indexOf(item);
    if (index == -1) return false;

    const buttonEl: HTMLDivElement = (e.target as any).closest(
      '[data-menu-list-button-id]'
    );
    if (!buttonEl) return;
    const buttonId = buttonEl.getAttribute('data-menu-list-button-id');
    if (!buttonId) return;

    this.options.onButtonClick(buttonId, index);
  }
}
