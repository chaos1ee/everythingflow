import { Card, Col, Form, Input, Row, Select } from 'antd'
import { QueryList, useQueryListJump } from 'react-toolkits'
import type { ColumnsType } from 'antd/es/table'
import type { TableListItem } from '~/features/table'

interface FormValues {
  param: number
  type: 1 | 2
}

const url = '/api/tables'

const TableList = () => {
  const [form] = Form.useForm<FormValues>()
  const jump = useQueryListJump()

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
              jump(url, 1)
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
      <Form form={form} initialValues={{ type: 1 }}>
        <QueryList<TableListItem, FormValues, { List: TableListItem[]; Total: number }>
          rowKey="id"
          columns={columns}
          url={url}
          transformResponse={response => {
            const { List, Total } = response
            return { list: List, total: Total }
          }}
          renderForm={() => (
            <Form>
              <Row gutter={20}>
                <Col>
                  <Form.Item
                    name="param"
                    dependencies={['type']}
                    rules={[
                      ({ getFieldValue }) => ({
                        validator(_, value) {
                          return new Promise((resolve, reject) => {
                            if (!value) {
                              if (getFieldValue('type') === 1) {
                                reject(new Error('请输入渠道 UID'))
                              } else {
                                reject(new Error('请输入身份证号'))
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
      </Form>
    </Card>
  )
}

export default TableList
