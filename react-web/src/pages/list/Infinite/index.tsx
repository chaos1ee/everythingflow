import { Card, DatePicker, Form, Input, Select } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import type { Dayjs } from 'dayjs'
import { last } from 'lodash-es'
import { InfiniteList } from 'react-toolkits'
import type { InfiniteListItem } from '../../../features/list'
import type { InfiniteListResponse } from '../../../types'

const action = '/api/infinite'

const { Option } = Select

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
      <InfiniteList<
        InfiniteListItem,
        {
          uid: number
          type: 'received' | 'spent'
          date: Dayjs
        },
        InfiniteListResponse<InfiniteListItem>
      >
        action={action}
        rowKey="id"
        columns={columns}
        getRowKey={data => last(data.list)?.id}
        hasMore={data => !!last(data)?.hasMore}
        getDataSource={data => data?.reduce((acc, curr) => acc.concat(curr.list ?? []), [] as InfiniteListItem[]) ?? []}
        transformArg={(values, rowKey) => {
          const { date, ...restValues } = values
          return {
            dt: date.format('YYYY-MM-DD'),
            ...restValues,
            rowkey: rowKey,
          }
        }}
        renderForm={form => (
          <Form form={form} layout="inline">
            <Form.Item label="UID" name="uid" rules={[{ required: true }]}>
              <Input />
            </Form.Item>
            <Form.Item label="类型" name="type">
              <Select allowClear style={{ width: '120px' }}>
                <Option value="received">增加</Option>
                <Option value="spent">减少</Option>
              </Select>
            </Form.Item>
            <Form.Item
              label="时间（UTC+0）"
              name="date"
              rules={[
                {
                  required: true,
                },
              ]}
            >
              <DatePicker />
            </Form.Item>
          </Form>
        )}
      />
    </Card>
  )
}

export default Infinite
