import type { RoleListItem, RoleV1, RoleV2 } from '@/features/permission'
import { PermissionList, useCreateRole, useRemoveRole, useUpdateRole } from '@/features/permission'
import { UsergroupAddOutlined } from '@ant-design/icons'
import type { TableColumnsType } from 'antd'
import { App, Card, Form, Input, Space } from 'antd'
import { Link } from 'react-router-dom'
import { useQueryListTrigger } from '@/stores/queryList'
import { useFormModal } from '@/components/FormModal'
import { usePermission } from '@/hooks/permission'
import { useToolkitsContext } from '@/components/ContextProvider'
import PermissionButton from '@/components/PermissionButton'
import { request } from '@/utils/request'
import Highlight from '@/components/Highlight'
import QueryList from '@/components/QueryList'
import { useTranslation } from '@/utils/i18n'

const url = '/api/usystem/role/list'

const useCreateModal = () => {
  const { message } = App.useApp()
  const trigger = useQueryListTrigger()
  const create = useCreateRole()
  const t = useTranslation()

  const onConfirm = async (values: { name: string; permissions: RoleV1['permissions'] | RoleV2['permissions'] }) => {
    await create.trigger({
      name: `role_${values.name}`,
      permissions: values.permissions,
    })
    trigger(url, { page: 1 })
    message.success(t('RoleList.createSuccessfully'))
  }

  return useFormModal<{
    name: string
    permissions: RoleV1['permissions'] | RoleV2['permissions']
  }>({
    title: t('RoleList.createTitle'),
    width: '50vw',
    layout: 'vertical',
    content: (
      <>
        <Form.Item label={t('name')} name="name" rules={[{ required: true }]}>
          <Input addonBefore="role_" />
        </Form.Item>
        <Form.Item name="permissions">
          <PermissionList />
        </Form.Item>
      </>
    ),
    onConfirm,
  })
}

const useUpdateModal = () => {
  const { message } = App.useApp()
  const trigger = useQueryListTrigger()
  const update = useUpdateRole()
  const t = useTranslation()

  const onConfirm = async (values: {
    id: number
    name: string
    permissions: RoleV1['permissions'] | RoleV2['permissions']
  }) => {
    await update.trigger({
      id: values.id,
      name: `role_${values.name}`,
      permissions: values.permissions,
    })
    trigger(url)
    message.success(t('RoleList.updateSuccessfully'))
  }

  return useFormModal<{
    id: number
    name: string
    permissions: RoleV1['permissions'] | RoleV2['permissions']
  }>({
    title: t('RoleList.updateTitle'),
    width: '50vw',
    layout: 'vertical',
    content: (
      <>
        <Form.Item hidden label="ID" name="id">
          <Input />
        </Form.Item>
        <Form.Item label={t('name')} name="name" rules={[{ required: true }]}>
          <Input readOnly addonBefore="role_" />
        </Form.Item>
        <Form.Item name="permissions">
          <PermissionList />
        </Form.Item>
      </>
    ),
    onConfirm,
  })
}

const RoleList = () => {
  const { accessible: viewable } = usePermission('200005', { isGlobalNS: true })
  const { modal, message } = App.useApp()
  const { usePermissionV2 } = useToolkitsContext()
  const remove = useRemoveRole()
  const trigger = useQueryListTrigger()
  const { showModal: showCreateModal, Modal: CreateModal } = useCreateModal()
  const { showModal: showUpdateModal, Modal: UpdateModal } = useUpdateModal()
  const t = useTranslation()

  const columns: TableColumnsType<RoleListItem> = [
    {
      title: t('name'),
      key: 'name',
      render(value: RoleListItem) {
        if (viewable) {
          return <Link to={`${value.name}`}>{value.name}</Link>
        } else {
          return <>{value.name}</>
        }
      },
    },
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: t('creationTime'),
      dataIndex: 'ctime',
      key: 'ctime',
    },
    {
      title: t('operation'),
      width: 150,
      align: 'center',
      render: (value: RoleListItem) => {
        return (
          <Space size="small">
            <PermissionButton
              isGlobalNS
              code="200003"
              size="small"
              type="link"
              onClick={async () => {
                const { data: role } = await request<RoleV1 | RoleV2>(
                  `/api/usystem/role/info${usePermissionV2 ? 'V2' : ''}?name=${value.name}`,
                  { isGlobalNS: true },
                )

                showUpdateModal({
                  initialValues: {
                    id: role?.id,
                    permissions: role?.permissions,
                    name: role?.name.replace(/^role_/, ''),
                  },
                })
              }}
            >
              {t('edit')}
            </PermissionButton>
            <PermissionButton
              isGlobalNS
              danger
              code="200004"
              size="small"
              type="link"
              onClick={() => {
                modal.confirm({
                  title: t('RoleList.deleteTitle'),
                  content: (
                    <Highlight texts={[value.name]}>{t('RoleList.deleteContent', { role: value.name })}</Highlight>
                  ),
                  async onOk() {
                    await remove.trigger({
                      id: value.id,
                      name: value.name,
                    })
                    trigger(url, { page: 1 })
                    message.success(t('RoleList.deleteSuccessfully'))
                  },
                })
              }}
            >
              {t('delete')}
            </PermissionButton>
          </Space>
        )
      },
    },
  ]

  return (
    <>
      <Card
        title={t('role')}
        extra={
          <PermissionButton
            isGlobalNS
            type="primary"
            code="200002"
            icon={<UsergroupAddOutlined />}
            onClick={() => {
              showCreateModal()
            }}
          >
            {t('RoleList.createTitle')}
          </PermissionButton>
        }
      >
        <QueryList<RoleListItem, undefined, { List: RoleListItem[]; Total: number }>
          isGlobalNS
          rowKey="name"
          columns={columns}
          code="200001"
          url={url}
          // 后端接口返回的数据不满足时转换一下
          transformResponse={response => {
            const { List, Total } = response
            return { list: List, total: Total }
          }}
        />
      </Card>
      {CreateModal}
      {UpdateModal}
    </>
  )
}

export default RoleList
