import { Card, Col, Form, Input, Row, Select, Typography } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import dayjs from 'dayjs'
import type { FC } from 'react'
import QueryList from '../../components/QueryList'
import type { OperationLogListItem } from '../../features/log'
import { useTranslation } from '../../hooks/i18n'

const { Option } = Select
const { Paragraph } = Typography

const OperationLogList: FC = () => {
  const t = useTranslation()

  const columns: ColumnsType<OperationLogListItem> = [
    {
      key: 'username',
      title: t('global.username'),
      dataIndex: 'uname',
      width: 100,
    },
    {
      key: 'label',
      title: t('global.label'),
      dataIndex: 'label',
      width: 150,
    },
    {
      key: 'method',
      title: t('global.method'),
      dataIndex: 'method',
      width: 100,
    },
    {
      key: 'route',
      title: t('global.route'),
      dataIndex: 'route',
      width: 200,
    },
    {
      key: 'request',
      title: t('global.request'),
      dataIndex: 'request',
      render(value: string) {
        return <Paragraph ellipsis={{ rows: 2, expandable: true }}>{value}</Paragraph>
      },
    },
    {
      key: 'response',
      title: t('global.response'),
      dataIndex: 'response',
      render(value: string) {
        return <Paragraph ellipsis={{ rows: 2, expandable: true }}>{value}</Paragraph>
      },
    },
    {
      key: 'creation_time',
      title: t('global.creationTime'),
      dataIndex: 'ctime',
      width: 200,
      render(value: string) {
        return dayjs(value).format('YYYY-MM-DD HH:mm:ss')
      },
    },
  ]

  return (
    <Card title="操作日志">
      <QueryList<
        OperationLogListItem,
        {
          uname?: string
          route?: string
          method?: 'get' | 'post'
          label?: string
        },
        {
          List: OperationLogListItem[]
          Total: number
        }
      >
        tableLayout="fixed"
        rowKey="id"
        columns={columns}
        action="/api/usystem/log/list"
        getParams={({ page, size, formValues }) => ({ ...formValues, page, size })}
        getTotal={response => response.Total}
        getDataSource={response => response.List}
        renderForm={form => (
          <Form form={form}>
            <Row gutter={10}>
              <Col span={4}>
                <Form.Item label={t('global.username')} name="uname">
                  <Input allowClear />
                </Form.Item>
              </Col>
              <Col span={4}>
                <Form.Item label={t('global.route')} name="route">
                  <Input allowClear />
                </Form.Item>
              </Col>
              <Col>
                <Form.Item label={t('global.method')} name="method">
                  <Select allowClear style={{ width: '100px' }}>
                    <Option value="get">GET</Option>
                    <Option value="post">POST</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={4}>
                <Form.Item label={t('global.label')} name="label">
                  <Input allowClear />
                </Form.Item>
              </Col>
            </Row>
          </Form>
        )}
      />
    </Card>
  )
}

export default OperationLogList
