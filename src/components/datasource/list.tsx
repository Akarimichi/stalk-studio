import React from 'react';
import { Empty, List, Tag, Button } from 'antd';
import { DataSource, DataSourceType } from '../../model/datasource/interfaces';


const styles = {
  listItem: {
    paddingLeft: 12,
    paddingRight: 12
  }
};


interface DataSourceListProps {
  dataSources: DataSource[],
  onItemSearch: (datasource: DataSource) => void
  onItemEdit: (datasource: DataSource) => void
  onItemDelete: (datasource: DataSource) => void
}


export const DataSourceList: React.FC<DataSourceListProps> = (props) => {
  return props.dataSources.length > 0 ? (
    <List
      itemLayout="horizontal"
      dataSource={props.dataSources}
      renderItem={item =>
        item.type === DataSourceType.JAEGER ? (
          <List.Item style={styles.listItem}>
            <List.Item.Meta
              title={<a href="#/" onClick={() => props.onItemSearch(item)}><Tag color="blue">JAEGER</Tag>{item.name}</a>}
            />
            <Button shape="circle" icon="edit" onClick={() => props.onItemEdit(item)} />
            <Button shape="circle" icon="delete" onClick={() => props.onItemDelete(item)} />
          </List.Item>
        ) : item.type === DataSourceType.JAEGER_JSON ? (
          <List.Item style={styles.listItem}>
            <List.Item.Meta
              title={<a href="#/" onClick={() => props.onItemSearch(item)}><Tag color="blue">JAEGER JSON</Tag>{item.name}</a>}
            />
            <Button shape="circle" icon="delete" onClick={() => props.onItemDelete(item)} />
          </List.Item>
        ) : item.type === DataSourceType.ZIPKIN ? (
          <List.Item style={styles.listItem}>
            <List.Item.Meta
              title={<a href="#/" onClick={() => props.onItemSearch(item)}><Tag color="orange">ZIPKIN</Tag>{item.name}</a>}
            />
            <Button shape="circle" icon="edit" onClick={() => props.onItemEdit(item)} />
            <Button shape="circle" icon="delete" onClick={() => props.onItemDelete(item)} />
          </List.Item>
        ) : item.type === DataSourceType.ZIPKIN_JSON ? (
          <List.Item style={styles.listItem}>
            <List.Item.Meta
              title={<a href="#/" onClick={() => props.onItemSearch(item)}><Tag color="orange">ZIPKIN JSON</Tag>{item.name}</a>}
            />
            <Button shape="circle" icon="delete" onClick={() => props.onItemDelete(item)} />
          </List.Item>
        ) : null}
    />
  ) : (
    <Empty description="No data sources yet" image={Empty.PRESENTED_IMAGE_SIMPLE} style={{ padding: 24 }} />
  );
};


export default DataSourceList;
