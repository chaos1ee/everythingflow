import { Card, Col, Form, Input, Row } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { useEffect } from 'react'
import { QueryList, useGameStore } from 'react-toolkits'
import type { ListItem } from '../../../features/list'
import type { ListResponse } from '../../../types'

const action = '/api/list'

const Pagination = () => {
  const { setGame } = useGameStore()

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

  useEffect(() => {
    let i = 0
    const timerId = setInterval(() => {
      console.log('InfiniteList is polling...')

      setGame((i++ % 2) + 1)
    }, 5000)

    return () => {
      clearInterval(timerId)
    }
  }, [])

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
          <Form form={form} autoComplete="off">
            <Row>
              <Col>
                <Form.Item label="名称" name="name">
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
