import { UsergroupAddOutlined } from '@ant-design/icons'
import type { FormProps, TableColumnsType } from 'antd'
import { App, Card, Form, Input, Space } from 'antd'
import { produce } from 'immer'
import { Link } from 'react-router-dom'
import { useToolkitsContext } from '../../../components/contextProvider'
import Highlight from '../../../components/highlight'
import { useTranslation } from '../../../components/locale'
import PermissionButton from '../../../components/permissionButton'
import { QueryList } from '../../../components/queryList'
import { useQueryListStore } from '../../../components/queryList/store'
import type { RoleListItem, RoleV1, RoleV2 } from '../../../features/permission'
import { PermissionList, useCreateRole, useRemoveRole, useUpdateRole } from '../../../features/permission'
import type { UseFormModalProps } from '../../../hooks/formModal'
import { useFormModal } from '../../../hooks/formModal'
import { usePermission } from '../../../hooks/permission'
import { request } from '../../../utils/request'

const action = '/api/usystem/role/list'

interface FormSchema {
  name: string
  permissions: RoleV1['permissions'] | RoleV2['permissions']
}

const useModal = (isCreate?: boolean) => {
  const { message } = App.useApp()
  const { t } = useTranslation()
  const { refetch, mutate } = useQueryListStore()
  const create = useCreateRole()
  const update = useUpdateRole()

  const title = isCreate ? t('RoleList.createTitle') : t('RoleList.updateTitle')

  const formProps: FormProps = {
    layout: 'vertical',
  }

  const content = (
    <>
      <Form.Item label={t('global.name')} name="name" rules={[{ required: true }]}>
        <Input disabled={!isCreate} addonBefore="role_" />
      </Form.Item>
      <Form.Item name="permissions">
        <PermissionList />
      </Form.Item>
    </>
  )

  const onConfirm: UseFormModalProps<FormSchema, { id: number }>['onConfirm'] = async (values, extraValues) => {
    if (isCreate) {
      await create.trigger({
        name: `role_${values.name}`,
        permissions: values.permissions,
      })
      refetch(action, 1)
      message.success(t('RoleList.createSuccessfully'))
    } else {
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
    }
  }

  return useFormModal<{
    name: string
    permissions: RoleV1['permissions'] | RoleV2['permissions']
  }>({
    title,
    width: '50vw',
    formProps,
    content,
    onConfirm,
  })
}

const RoleList = () => {
  const { accessible: viewable } = usePermission('200005', true)
  const { modal, message } = App.useApp()
  const { t } = useTranslation()
  const { usePermissionApiV2 } = useToolkitsContext()
  const { mutate } = useQueryListStore()
  const { show: showCreateModal, modal: createModal } = useModal(true)
  const { show: showUpdateModal, modal: updateModal } = useModal()
  const remove = useRemoveRole()

  const handleUpdateBtnClick = async (record: RoleListItem) => {
    const { data: role } = await request<RoleV1 | RoleV2>(
      `/api/usystem/role/info${usePermissionApiV2 ? 'V2' : ''}?name=${record.name}`,
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
  }

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
      render: (_, record) => {
        return (
          <Space size="small">
            <PermissionButton
              isGlobal
              code="200003"
              size="small"
              type="link"
              onClick={async () => {
                handleUpdateBtnClick(record)
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
                    <Highlight texts={[record.name]}>{t('RoleList.deleteContent', { role: record.name })}</Highlight>
                  ),
                  async onOk() {
                    await remove.trigger({
                      id: record.id,
                      name: record.name,
                    })
                    mutate(action, prev => {
                      return produce(prev, draft => {
                        const index = draft?.dataSource?.findIndex(item => item.id === record.id)
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
