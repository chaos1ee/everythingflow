import { UserAddOutlined } from '@ant-design/icons'
import type { TableColumnsType } from 'antd'
import { App, Card, Col, Form, Input, Row, Select, Space, Tag } from 'antd'
import { produce } from 'immer'
import type { FC } from 'react'
import { Link } from 'react-router-dom'
import Highlight from '../../components/Highlight'
import PermissionButton from '../../components/PermissionButton'
import QueryList from '../../components/QueryList'
import type { UserListItem } from '../../features/permission'
import { useAllRoles, useCreateUser, useRemoveUser, useUpdateUser } from '../../features/permission'
import { useFormModal } from '../../hooks/formModal'
import { useTranslation } from '../../hooks/i18n'
import { useQueryListStore } from '../../stores/queryList'

const { Option } = Select

export const action = '/api/usystem/user/list'

function useCreatingUserModal() {
  const { message } = App.useApp()
  const create = useCreateUser()
  const { data: roles, isLoading } = useAllRoles()
  const { setPayload } = useQueryListStore()
  const t = useTranslation()

  return useFormModal<{ id: string; name: string; roles: string[] }>({
    title: t('UserList.createTitle'),
    content: form => (
      <Form form={form} labelCol={{ flex: '80px' }}>
        <Form.Item label={t('global.name')} name="name" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item label={t('global.role')} name="roles">
          <Select allowClear mode="multiple" loading={isLoading}>
            {(roles ?? []).map(role => (
              <Option value={role.name} key={role.id}>
                {role.name}
              </Option>
            ))}
          </Select>
        </Form.Item>
      </Form>
    ),
    async onConfirm(values) {
      await create.trigger(values)
      setPayload(action, { page: 1 })
      message.success(t('UserList.createSuccessfully'))
    },
  })
}

function useUpdatingUserModal() {
  const { message } = App.useApp()
  const update = useUpdateUser()
  const { data: roles, isLoading } = useAllRoles()
  const { mutate } = useQueryListStore()
  const t = useTranslation()

  return useFormModal<{ id: string; name: string; roles: string[] }>({
    title: t('UserList.updateTitle'),
    content: form => (
      <Form form={form} labelCol={{ flex: '80px' }}>
        <Form.Item label={t('global.name')} name="name" rules={[{ required: true }]}>
          <Input readOnly />
        </Form.Item>
        <Form.Item label={t('global.role')} name="roles">
          <Select
            allowClear
            mode="multiple"
            loading={isLoading}
            options={roles?.map(role => ({
              label: role.name,
              value: role.name,
            }))}
            // FIXME: 在项目中引入时弹出框会被 Modal 遮盖，暂时不知道原因。
            dropdownStyle={{ zIndex: 9999 }}
          />
        </Form.Item>
      </Form>
    ),
    async onConfirm(values, _form, extraValues: { id: string }) {
      await update.trigger(values)
      mutate<UserListItem>(
        action,
        prev => {
          return produce(prev, draft => {
            if (draft?.dataSource) {
              const index = draft.dataSource?.findIndex(item => item.id === extraValues.id)
              if (index !== -1) {
                draft.dataSource[index].roles = values.roles
              }
            }
          })
        },
        { revalidate: false },
      )
      message.success(t('UserList.updateSuccessfully'))
    },
  })
}

const UserList: FC = () => {
  const { modal, message } = App.useApp()
  const remove = useRemoveUser()
  const { mutate } = useQueryListStore()
  const { show: showCreatingModal, contextHolder: creatingContextHolder } = useCreatingUserModal()
  const { show: showUpdatingModal, contextHolder: updatingContextHolder } = useUpdatingUserModal()
  const t = useTranslation()

  const columns: TableColumnsType<UserListItem> = [
    {
      title: t('global.name'),
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: t('global.role'),
      dataIndex: 'roles',
      key: 'roles',
      width: '40%',
      render(value: string[]) {
        return (
          <Row gutter={[4, 4]}>
            {(value || []).map((item: string) => (
              <Col key={item}>
                {item === 'root' ? (
                  <Tag color="#f50">{item}</Tag>
                ) : (
                  <Tag color="#ff5a00">
                    <Link to={`/permission/role/${item}`}>{item}</Link>
                  </Tag>
                )}
              </Col>
            ))}
          </Row>
        )
      },
    },
    {
      title: t('global.creationTime'),
      dataIndex: 'Ctime',
      key: 'ctime',
    },
    {
      title: t('global.operation'),
      width: 150,
      align: 'center',
      render: (value: UserListItem) => (
        <Space>
          <PermissionButton
            isGlobalNS
            size="small"
            type="link"
            code="100003"
            onClick={() => {
              showUpdatingModal({
                initialValues: {
                  name: value.name,
                  roles: value.roles,
                },
                extraValues: {
                  id: value.id,
                },
              })
            }}
          >
            {t('global.update')}
          </PermissionButton>
          <PermissionButton
            isGlobalNS
            danger
            size="small"
            code="100004"
            type="link"
            onClick={() => {
              modal.confirm({
                title: t('UserList.deleteTitle'),
                content: (
                  <Highlight texts={[value.name]}>{t('UserList.deleteContent', { user: value.name })}</Highlight>
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
                  message.success(t('UserList.deleteSuccessfully'))
                },
              })
            }}
          >
            {t('global.delete')}
          </PermissionButton>
        </Space>
      ),
    },
  ]

  return (
    <Card
      title={t('global.user')}
      extra={
        <PermissionButton
          isGlobalNS
          type="primary"
          icon={<UserAddOutlined />}
          code="100002"
          onClick={() => {
            showCreatingModal()
          }}
        >
          {t('UserList.createTitle')}
        </PermissionButton>
      }
    >
      <QueryList<UserListItem, undefined, { List: UserListItem[]; Total: number }>
        isGlobalNS
        code="100001"
        action={action}
        rowKey="id"
        columns={columns}
        getTotal={response => response.Total}
        getDataSource={response => response.List}
      />
      {creatingContextHolder}
      {updatingContextHolder}
    </Card>
  )
}

export default UserList
