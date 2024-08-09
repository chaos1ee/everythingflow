import { Card, Form, Input } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { QueryList } from 'react-toolkits'
import type { ListItem } from '../../../features/list'
import type { ListResponse } from '../../../types'

const url = '/api/list'

const Pagination = () => {
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
      <QueryList<ListItem, { name: string }, ListResponse<ListItem>>
        url={url}
        rowKey="id"
        columns={columns}
        getTotal={response => response?.Total}
        getDataSource={response => response?.List}
        renderForm={form => (
          <Form form={form} autoComplete="off">
            <Form.Item label="名称" name="name" rules={[{ required: true }]}>
              <Input />
            </Form.Item>
          </Form>
        )}
      />
    </Card>
  )
}
export default Pagination
