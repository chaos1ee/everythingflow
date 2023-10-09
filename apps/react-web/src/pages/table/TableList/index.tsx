import { Card, Col, Form, Input, Row, Select } from 'antd'
import { QueryList, useQueryListTrigger } from 'react-toolkits'
import type { ColumnsType } from 'antd/es/table'
import type { TableListItem } from '@/features/table'

interface FormValues {
  param: number
  type: 1 | 2
}

const url = '/api/tables'

const TableList = () => {
  const trigger = useQueryListTrigger()

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
              trigger(url, { page: 1 }, undefined, { revalidate: true })
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
              <Col>
                <Form.Item
                  name="param"
                  dependencies={['type']}
                  rules={[
                    ({ getFieldValue }) => ({
                      required: true,
                      validator(_, value) {
                        return new Promise((resolve, reject) => {
                          if (!value) {
                            if (getFieldValue('type') === 1) {
                              reject(new Error('请输入实例'))
                            } else {
                              reject(new Error('请输入数据库名称'))
                            }
                          }
                          resolve(1)
                        })
                      },
                    }),
                  ]}
                >
                  <Input
                    addonBefore={
                      <Form.Item noStyle name="type">
                        <Select>
                          <Select.Option value={1}>实例</Select.Option>
                          <Select.Option value={2}>数据库</Select.Option>
                        </Select>
                      </Form.Item>
                    }
                  />
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
