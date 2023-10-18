import { Card, Col, Form, Input, Row } from 'antd'
import { QueryList, useQueryListMutate } from 'react-toolkits'
import type { ColumnsType } from 'antd/es/table'
import type { TableListItem } from '@/features/table'

interface FormValues {
  param: number
  type: 1 | 2
}

const url = '/api/tables'

const TableList = () => {
  const mutate = useQueryListMutate()

  const columns: ColumnsType<TableListItem> = [
    {
      key: 'table_name',
      title: '表名',
      dataIndex: 'name',
    },
    {
      key: 'creation_time',
      title: '创建时间',
      dataIndex: 'ctime',
    },
    {
      key: 'action',
      title: '操作',
      render() {
        return (
          // eslint-disable-next-line
          <a
            onClick={async () => {
              mutate(url, { page: 1 })
            }}
          >
            删除
          </a>
        )
      },
    },
  ]

  return (
    <Card title="表">
      <QueryList<TableListItem, FormValues, { List: TableListItem[]; Total: number }>
        code="500000"
        rowKey="id"
        columns={columns}
        url={url}
        transformResponse={response => {
          const { List, Total } = response
          return { list: List, total: Total }
        }}
        renderForm={form => (
          <Form form={form} initialValues={{ type: 1 }}>
            <Row gutter={20}>
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

export default TableList
