import { Card, Col, Form, Input, Row, Select } from 'antd'
import { QueryList, useQueryListJump } from 'react-toolkits'
import type { ColumnsType } from 'antd/es/table'
import type { TableListItem } from '~/features/table'

interface FormValues {
  instanceId: string
  database: string
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
      <Form form={form}>
        <QueryList<TableListItem, FormValues, { List: TableListItem[]; Total: number }>
          rowKey="id"
          columns={columns}
          url={url}
          transformResponse={response => {
            const { List, Total } = response
            return { list: List, total: Total }
          }}
        >
          <Row gutter={20}>
            <Col>
              <Form.Item label="实例 ID" name="instanceId" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
            </Col>
            <Col span={4}>
              <Form.Item label="数据库" name="database" rules={[{ required: true }]}>
                <Select
                  showSearch
                  optionFilterProp="label"
                  options={[
                    { label: 'db1', value: 1 },
                    { label: 'db2', value: 2 },
                  ]}
                />
              </Form.Item>
            </Col>
          </Row>
        </QueryList>
      </Form>
    </Card>
  )
}

export default TableList
