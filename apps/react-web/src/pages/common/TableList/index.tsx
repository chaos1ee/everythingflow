import type { TableListItem } from '@/features/common'
import { useDatabases } from '@/features/common'
import { Card, Col, Form, Row, Select } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { useRef } from 'react'
import type { QueryListRef } from 'react-toolkits'
import { QueryList, useQueryListStore } from 'react-toolkits'

interface FormValues {
  param: number
  type: 1 | 2
}

const url = '/api/tables?foo=123'

const TableList = () => {
  const { mutate } = useQueryListStore()
  const { data } = useDatabases()
  const formRef = useRef<QueryListRef>(null)

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
        ref={formRef}
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
            <Row gutter={10}>
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
        )}
      />
    </Card>
  )
}

export default TableList
