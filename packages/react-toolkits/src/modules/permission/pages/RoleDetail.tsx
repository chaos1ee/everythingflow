import { Breadcrumb, Card, Descriptions, Skeleton } from 'antd'
import { Link, useParams } from 'react-router-dom'
import type { Role } from '../types'
import PermissionList from '../components/PermissionList'
import { useRole, useUpdateRoleModal } from '../hooks'
import { PermissionButton } from '../../../components'
import { createHttpClient } from '../../../httpClient'

const httpClient = createHttpClient({ headers: { 'app-id': 'global' } })

const RoleDetail = () => {
  const params = useParams<'name'>()
  const { data, isLoading, refetch } = useRole(params.name as string)
  const { showModal, Modal } = useUpdateRoleModal(async () => {
    await refetch()
  })

  return (
    <>
      <Breadcrumb
        style={{ marginBottom: 24 }}
        items={[
          {
            key: '1',
            title: <Link to="/permission/role">角色</Link>,
          },
          {
            key: '2',
            title: params.name,
          },
        ]}
      />
      <Card
        title="权限详情"
        extra={
          <PermissionButton
            code="200003"
            type="link"
            onClick={async () => {
              const role = await httpClient.get<Role>('/usystem/role/info', { params: { name: params.name } })
              showModal({
                initialValues: {
                  id: role?.id,
                  permissions: role?.permissions,
                  name: role?.name.replace(/^role_/, ''),
                },
              })
            }}
          >
            更新
          </PermissionButton>
        }
      >
        <Skeleton loading={isLoading}>
          <Descriptions column={3} layout="vertical">
            <Descriptions.Item label="名称">{data?.name}</Descriptions.Item>
            <Descriptions.Item label="ID">{data?.id}</Descriptions.Item>
            <Descriptions.Item label="创建时间">{data?.ctime}</Descriptions.Item>
            <Descriptions.Item label="权限" span={3}>
              <PermissionList readonly value={data?.permissions} />
            </Descriptions.Item>
          </Descriptions>
        </Skeleton>
      </Card>
      {Modal}
    </>
  )
}

export default RoleDetail
