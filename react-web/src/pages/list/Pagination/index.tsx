import { Card, Col, Form, Input, Row } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { QueryList } from 'react-toolkits'
import type { ListItem } from '../../../features/list'
import type { ListResponse } from '../../../types'

const action = '/api/list'

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
        action={action}
        rowKey="id"
        columns={columns}
        getTotal={response => response.Total}
        getDataSource={response => response.List}
        method="POST"
        getBody={({ formValues, page, size }) => ({ ...formValues, page, size })}
        renderForm={form => (
          <Form form={form}>
            <Row>
              <Col>
                <Form.Item label="名称" name="name" rules={[{ required: true }]}>
                  <Input />
                </Form.Item>
              </Col>
            </Row>
          </Form>
        )}
      />
    </Card>
  )
}
export default Pagination
