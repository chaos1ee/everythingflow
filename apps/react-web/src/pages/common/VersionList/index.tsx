import type { VersionListItem } from '@/features/common'
import { Button, Card, Col, Form, Input, Row } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { QueryList, useFormModal } from 'react-toolkits'

const url = '/api/version/list'

function useCreateModal() {
  return useFormModal<{ source: string; target: string; comment?: string }>({
    title: '创建版本',
    width: '500px',
    content: form => (
      <Form form={form} layout="vertical">
        <Row gutter={20}>
          <Col span={12}>
            <Form.Item label="源版本" name="source" rules={[{ required: true }]}>
              <Input />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="目标版本" name="target" rules={[{ required: true }]}>
              <Input />
            </Form.Item>
          </Col>
        </Row>
        <Form.Item label="备注" name="comment">
          <Input.TextArea rows={2} />
        </Form.Item>
      </Form>
    ),
    async onConfirm(values, form) {
      console.log(values, form)
    },
  })
}

const VersionList = () => {
  const [form] = Form.useForm()
  const { show, contextHolder } = useCreateModal()

  const columns: ColumnsType<VersionListItem> = [
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
    {
      key: 'author',
      title: '操作者',
      dataIndex: 'auth',
    },
    {
      key: 'ctime',
      title: '创建时间',
      dataIndex: 'ctime',
      width: 200,
    },
  ]

  return (
    <Card
      title="版本列表"
      extra={
        <Button
          type="primary"
          onClick={() => {
            show({ initialValues: { source: 'source1', target: 'target1', comment: '123' } })
          }}
        >
          创建版本
        </Button>
      }
    >
      <QueryList
        rowKey="id"
        columns={columns}
        url={url}
        renderForm={form => (
          <Form form={form}>
            <Row gutter={10}>
              <Col>
                <Form.Item label="名称" name="name">
                  <Input />
                </Form.Item>
              </Col>
            </Row>
          </Form>
        )}
      />
      {contextHolder}
    </Card>
  )
}

export default VersionList
