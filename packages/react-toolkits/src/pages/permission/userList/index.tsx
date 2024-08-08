import { UserAddOutlined } from '@ant-design/icons'
import type { TableColumnsType } from 'antd'
import { App, Card, Col, Form, Input, Row, Select, Space, Tag } from 'antd'
import { produce } from 'immer'
import type { FC } from 'react'
import { Link } from 'react-router-dom'
import Highlight from '../../../components/highlight'
import { useTranslation } from '../../../components/locale'
import { PermissionButton } from '../../../components/permissionButton'
import { QueryList } from '../../../components/queryList'
import { useQueryListStore } from '../../../components/queryList/store'
import type { UserListItem } from '../../../features/permission'
import { useAllRoles, useCreateUser, useRemoveUser, useUpdateUser } from '../../../features/permission'
import type { UseFormModalProps } from '../../../hooks/formModal'
import { useFormModal } from '../../../hooks/formModal'

const { Option } = Select

export const url = '/api/usystem/user/list'

interface FormSchema {
  id: string
  name: string
  roles: string[]
}

interface ExtraValues {
  id: string
}

const useModal = (isCreate?: boolean) => {
  const { message } = App.useApp()
  const { t } = useTranslation()
  const { refetch, mutate } = useQueryListStore()
  const { data: roles, isLoading } = useAllRoles()
  const create = useCreateUser()
  const update = useUpdateUser()

  const title = isCreate ? t('UserList.createTitle') : t('UserList.updateTitle')

  const content = (
    <>
      <Form.Item label={t('global.name')} name="name" rules={[{ required: true }]}>
        <Input disabled={!isCreate} />
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
    </>
  )

  const onConfirm: UseFormModalProps<FormSchema, ExtraValues>['onConfirm'] = async (values, extraValues) => {
    if (isCreate) {
      await create.trigger(values)
      refetch(url, 1)
      message.success(t('UserList.createSuccessfully'))
    } else {
      await update.trigger(values)
      mutate<UserListItem>(
        url,
        prev => {
          return produce(prev, draft => {
            if (draft?.dataSource) {
              const index = draft.dataSource?.findIndex(item => item.id === extraValues?.id)
              if (index !== -1) {
                draft.dataSource[index].roles = values.roles
              }
            }
          })
        },
        { revalidate: false },
      )
      message.success(t('UserList.updateSuccessfully'))
    }
  }

  return useFormModal({
    title,
    formProps: {
      labelCol: { flex: '80px' },
    },
    content,
    onConfirm,
  })
}

const UserList: FC = () => {
  const { modal, message } = App.useApp()
  const remove = useRemoveUser()
  const { mutate } = useQueryListStore()
  const { show: showCreateModal, modal: createModal } = useModal(true)
  const { show: showUpdateModal, modal: updateModal } = useModal()
  const { t } = useTranslation()

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
                    <Link to={`../role/${item}`}>{item}</Link>
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
            isGlobal
            size="small"
            type="link"
            code="100003"
            onClick={() => {
              showUpdateModal({
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
            isGlobal
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
                  mutate(url, prev => {
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
    <>
      <Card
        title={t('global.user')}
        extra={
          <PermissionButton
            isGlobal
            type="primary"
            icon={<UserAddOutlined />}
            code="100002"
            onClick={() => {
              showCreateModal()
            }}
          >
            {t('UserList.createTitle')}
          </PermissionButton>
        }
      >
        <QueryList<UserListItem, undefined, { List: UserListItem[]; Total: number }>
          isGlobal
          code="100001"
          url={url}
          rowKey="id"
          columns={columns}
          getTotal={response => response.Total}
          getDataSource={response => response.List}
        />
      </Card>
      {createModal}
      {updateModal}
    </>
  )
}

export default UserList
