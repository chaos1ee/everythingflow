import { UsergroupAddOutlined } from '@ant-design/icons'
import type { TableColumnsType } from 'antd'
import { App, Card, Form, Input, Space } from 'antd'
import { produce } from 'immer'
import { Link } from 'react-router-dom'
import { useToolkitsContext } from '../../../components/ContextProvider'
import Highlight from '../../../components/Highlight'
import PermissionButton from '../../../components/PermissionButton'
import QueryList from '../../../components/QueryList'
import { useQueryListStore } from '../../../components/QueryList/store'
import type { RoleListItem, RoleV1, RoleV2 } from '../../../features/permission'
import { PermissionList, useCreateRole, useRemoveRole, useUpdateRole } from '../../../features/permission'
import { useFormModal } from '../../../hooks/formModal'
import { useTranslation } from '../../../hooks/i18n'
import { usePermission } from '../../../hooks/permission'
import { request } from '../../../utils/request'

const action = '/api/usystem/role/list'

const useCreateModal = () => {
  const { message } = App.useApp()
  const { refresh } = useQueryListStore()
  const create = useCreateRole()
  const t = useTranslation()

  const onConfirm = async (values: { name: string; permissions: RoleV1['permissions'] | RoleV2['permissions'] }) => {
    await create.trigger({
      name: `role_${values.name}`,
      permissions: values.permissions,
    })
    refresh(action, 1)
    message.success(t('RoleList.createSuccessfully'))
  }

  return useFormModal<{
    name: string
    permissions: RoleV1['permissions'] | RoleV2['permissions']
  }>({
    title: t('RoleList.createTitle'),
    width: '50vw',
    formProps: {
      layout: 'vertical',
    },
    content: (
      <>
        <Form.Item label={t('global.name')} name="name" rules={[{ required: true }]}>
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
  const { mutate } = useQueryListStore()
  const update = useUpdateRole()
  const t = useTranslation()

  return useFormModal<
    {
      name: string
      permissions: RoleV1['permissions'] | RoleV2['permissions']
    },
    {
      id: number
    }
  >({
    title: t('RoleList.updateTitle'),
    width: '50vw',
    content: (
      <>
        <Form.Item label={t('global.name')} name="name" rules={[{ required: true }]}>
          <Input readOnly addonBefore="role_" />
        </Form.Item>
        <Form.Item name="permissions">
          <PermissionList />
        </Form.Item>
      </>
    ),
    onConfirm: async (values, extraValues) => {
      await update.trigger({
        id: extraValues?.id as number,
        name: `role_${values.name}`,
        permissions: values.permissions,
      })
      mutate(
        action,
        prev =>
          produce(prev, draft => {
            const match = draft?.dataSource?.find(item => item.id === extraValues?.id)

            if (match) {
              match.permissions = values.permissions
            }
          }),
        { revalidate: false },
      )
      message.success(t('RoleList.updateSuccessfully'))
    },
  })
}

const RoleList = () => {
  const { accessible: viewable } = usePermission('200005', true)
  const { modal, message } = App.useApp()
  const { usePermissionApiV2 } = useToolkitsContext()
  const remove = useRemoveRole()
  const { mutate } = useQueryListStore()
  const { show: showCreateModal, modal: createModal } = useCreateModal()
  const { show: showUpdateModal, modal: updateModal } = useUpdateModal()
  const t = useTranslation()

  const columns: TableColumnsType<RoleListItem> = [
    {
      title: t('global.name'),
      key: 'name',
      render(value: RoleListItem) {
        if (viewable) {
          return (
            <Link to={`${value.name}`} relative="path">
              {value.name}
            </Link>
          )
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
      title: t('global.creationTime'),
      dataIndex: 'ctime',
      key: 'ctime',
    },
    {
      title: t('global.operation'),
      width: 150,
      align: 'center',
      render: (value: RoleListItem) => {
        return (
          <Space size="small">
            <PermissionButton
              isGlobal
              code="200003"
              size="small"
              type="link"
              onClick={async () => {
                const { data: role } = await request<RoleV1 | RoleV2>(
                  `/api/usystem/role/info${usePermissionApiV2 ? 'V2' : ''}?name=${value.name}`,
                  { isGlobal: true },
                )
                showUpdateModal({
                  initialValues: {
                    permissions: role?.permissions,
                    name: role?.name.replace(/^role_/, ''),
                  },
                  extraValues: {
                    id: role?.id,
                  },
                })
              }}
            >
              {t('global.edit')}
            </PermissionButton>
            <PermissionButton
              isGlobal
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
                    mutate(action, prev => {
                      return produce(prev, draft => {
                        const index = draft?.dataSource?.findIndex(item => item.id === value.id)
                        if (index) {
                          draft?.dataSource?.splice(index, 1)
                        }
                      })
                    })
                    message.success(t('RoleList.deleteSuccessfully'))
                  },
                })
              }}
            >
              {t('global.delete')}
            </PermissionButton>
          </Space>
        )
      },
    },
  ]

  return (
    <>
      <Card
        title={t('global.role')}
        extra={
          <PermissionButton
            isGlobal
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
          isGlobal
          rowKey="name"
          columns={columns}
          code="200001"
          action={action}
          getTotal={response => response.Total}
          getDataSource={response => response.List}
        />
      </Card>
      {createModal}
      {updateModal}
    </>
  )
}

export default RoleList
