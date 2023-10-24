import { Card, Col, Form, Row, Select } from 'antd'
import { QueryList, useQueryListStore } from 'react-toolkits'
import type { ColumnsType } from 'antd/es/table'
import type { TableListItem } from '@/features/table'
import { useDatabases } from '@/features/table'

interface FormValues {
  param: number
  type: 1 | 2
}

const url = '/api/tables?foo=123'

const TableList = () => {
  const { mutate } = useQueryListStore()
  const { data } = useDatabases()
  const [form] = Form.useForm<FormValues>()

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
        form={{
          instance: form,
          children: (
            <Form form={form} initialValues={{ type: 1 }}>
              <Row gutter={20}>
                <Col>
                  <Form.Item label="名称" name="name" rules={[{ required: true }]}>
                    <Select
                      style={{ width: '150px' }}
                      options={data?.map(item => ({ label: item.name, value: item.id }))}
                    />
                  </Form.Item>
                </Col>
              </Row>
            </Form>
          ),
        }}
      />
    </Card>
  )
}

export default TableList
