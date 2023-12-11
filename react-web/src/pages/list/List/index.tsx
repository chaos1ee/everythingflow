import type { ListItem } from '@/features/list'
import type { ListResponse } from '@/types'
import { Card } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { QueryList } from 'react-toolkits'

const url = '/api/list'

const List = () => {
  const columns: ColumnsType<ListItem> = [
    {
      key: 'id',
      title: 'ID',
      dataIndex: 'id',
    },
    {
      key: 'name',
      title: '名称',
      dataIndex: 'name',
    },
  ]

  return (
    <Card title="List">
      <QueryList<ListItem, undefined, ListResponse<ListItem>>
        url={url}
        rowKey="id"
        columns={columns}
        transformResponse={data => ({
          list: data.List,
          total: data.Total,
        })}
      />
    </Card>
  )
}
export default List
