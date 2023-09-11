import type { MenuProps } from 'antd'
import { App, Button, Card, Col, Divider, Dropdown, Form, Input, Row, Space } from 'antd'
import {
  Highlight,
  PermissionButton,
  QueryList,
  useFormModal,
  useQueryListJump,
  useQueryListMutate,
} from 'react-toolkits'
import type { ColumnsType } from 'antd/es/table'
import type { VersionListItem } from '~/features/table'
import {
  useCreateVersion,
  useMergeVersion,
  useRemoveVersion,
  useUpdateVersion,
  useUploadTableModal,
  VersionSelect,
} from '~/features/table'
import { useCallback } from 'react'
import { DownOutlined } from '@ant-design/icons'
import { Link } from 'react-router-dom'
import { produce } from 'immer'

const url = '/api/version/list'

const useCreateModal = () => {
  const create = useCreateVersion()
  const jump = useQueryListJump()

  return useFormModal<{ name: string; comment?: string; parent_version?: string }>({
    title: '创建版本',
    labelCol: { flex: '80px' },
    content: (
      <>
        <Form.Item label="名称" name="name" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item label="备注" name="comment">
          <Input.TextArea rows={2} />
        </Form.Item>
        <Form.Item label="继承版本" name="parent_version">
          <VersionSelect />
        </Form.Item>
      </>
    ),
    async onConfirm(values) {
      await create.trigger(values)
      jump(url, 1)
    },
  })
}

const useUpdateModal = () => {
  const update = useUpdateVersion()
  const mutate = useQueryListMutate()

  return useFormModal<{ id: string; name: string; comment?: string }>({
    title: '更新版本信息',
    content: (
      <>
        <Form.Item label="ID" name="id" rules={[{ required: true }]}>
          <Input disabled />
        </Form.Item>
        <Form.Item label="名称" name="name" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item label="备注" name="comment">
          <Input />
        </Form.Item>
      </>
    ),
    async onConfirm(values) {
      await update.trigger(values)
      await mutate<VersionListItem>(
        url,
        prev => {
          return produce(prev, draft => {
            if (!draft?.list) return

            const index = draft?.list.findIndex(item => item.id === values.id)

            draft.list[index] = {
              ...draft.list[index],
              name: values.name,
              comment: values.comment,
            }
          })
        },
        { revalidate: false },
      )
    },
  })
}

const useMergeModal = () => {
  const { message } = App.useApp()
  const merge = useMergeVersion()

  return useFormModal<{ source: string; target: string; comment?: string }>({
    title: '合并版本',
    layout: 'vertical',
    content: (
      <>
        <Row gutter={20}>
          <Col span={12}>
            <Form.Item label="源版本" name="source" rules={[{ required: true }]}>
              <VersionSelect />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="目标版本" name="target" rules={[{ required: true }]}>
              <VersionSelect />
            </Form.Item>
          </Col>
        </Row>
        <Form.Item label="备注" name="comment">
          <Input.TextArea rows={2} />
        </Form.Item>
      </>
    ),
    async onConfirm(values) {
      await merge.trigger(values)
      message.success('合并成功')
    },
  })
}

const VersionList = () => {
  const { modal } = App.useApp()
  const remove = useRemoveVersion()
  const mutate = useQueryListMutate()

  const { showModal: showCreateModal, Modal: CreateModal } = useCreateModal()
  const { showModal: showUploadModal, Modal: UploadModal } = useUploadTableModal()
  const { showModal: showMergeModal, Modal: MergeModal } = useMergeModal()

  const removeHandler = useCallback(
    (record: VersionListItem) => {
      modal.confirm({
        title: '删除版本',
        content: (
          <Highlight texts={[record.name]}>
            确定要删除版本
            {record.name}
            {' '}
            吗？
          </Highlight>
        ),
        onOk: async () => {
          await remove.trigger(record.id)
          await mutate<VersionListItem>(
            url,
            prev =>
              produce(prev, draft => {
                if (!draft?.list) return
                const index = draft?.list.findIndex(item => item.id === record.id)
                draft.list.splice(index, 1)
              }),
            { revalidate: false },
          )
        },
      })
    },
    [modal, mutate, remove],
  )

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
    {
      key: 'action',
      title: '操作',
      width: 250,
      align: 'center',
      render(_, record) {
        const items: MenuProps['items'] = [
          {
            key: 'view_table_list',
            label: <Link to={`${record.id}/table?name=${record.name}`}>查看版本下的表</Link>,
          },
          {
            key: 'upload_table',
            label: '上传表',
            onClick() {
              showUploadModal({
                initialValues: {
                  versionId: record.id,
                },
              })
            },
          },
          {
            key: 'export_all_tables',
            label: <Link to={`${record.id}/table`}>导出全部表</Link>,
          },
          {
            type: 'divider',
          },
          // {
          //   key: 'update',
          //   label: '更新版本信息',
          //   onClick() {
          //     showUpdateModal({
          //       initialValues: {
          //         id: record.id,
          //         name: record.name,
          //         comment: record.comment,
          //       },
          //     })
          //   },
          // },
          {
            key: 'delete',
            danger: true,
            label: '删除版本',
            onClick() {
              removeHandler(record)
            },
          },
        ]

        return (
          <Space size="small" split={<Divider type="vertical" />}>
            <PermissionButton size="small" code="300001" type="link" href={`${record.id}/record`}>
              查看操作记录
            </PermissionButton>
            <Dropdown menu={{ items }}>
              <Button type="link" onClick={e => e.preventDefault()}>
                <Space size="small">
                  更多
                  <DownOutlined />
                </Space>
              </Button>
            </Dropdown>
          </Space>
        )
      },
    },
  ]

  return (
    <>
      <Card
        title="版本列表"
        extra={
          <Space>
            <Button
              type="primary"
              onClick={() => {
                showCreateModal()
              }}
            >
              创建版本
            </Button>
            <Button
              onClick={() => {
                showMergeModal()
              }}
            >
              合并版本
            </Button>
          </Space>
        }
      >
        <Form>
          <QueryList rowKey="id" columns={columns} url={url} />
        </Form>
      </Card>
      {CreateModal}
      {UploadModal}
      {MergeModal}
    </>
  )
}

export default VersionList
