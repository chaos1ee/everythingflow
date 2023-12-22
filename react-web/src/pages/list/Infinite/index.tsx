import type { InfiniteListItem } from '@/features/list'
import type { InfiniteListResponse } from '@/types'
import { Card } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { last } from 'lodash-es'
import { InfiniteList } from 'react-toolkits'

const url = '/api/infinite'

const Infinite = () => {
  const columns: ColumnsType<InfiniteListItem> = [
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
    <Card title="InfiniteList">
      <InfiniteList<InfiniteListItem, undefined, InfiniteListResponse<InfiniteListItem>>
        url={url}
        rowKey="id"
        columns={columns}
        getRowKey={data => last(data.list)?.id}
        hasMore={data => !!last(data)?.hasMore}
        getDataSource={data => data?.reduce((acc, curr) => acc.concat(curr.list ?? []), [] as InfiniteListItem[]) ?? []}
        transformArg={(_, rowKey) => {
          return {
            limit: 2,
            rowKey,
          }
        }}
      />
    </Card>
  )
}

export default Infinite
