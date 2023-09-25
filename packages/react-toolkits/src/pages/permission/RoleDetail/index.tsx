import { PermissionList, useRole } from '@/features/permission'
import { Breadcrumb, Card, Descriptions, Skeleton } from 'antd'
import { Link, useParams } from 'react-router-dom'

const RoleDetail = () => {
  const params = useParams()
  const { data, isLoading } = useRole(params.name as string)

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
      <Card title="权限详情">
        <Skeleton loading={isLoading}>
          <Descriptions column={3} layout="vertical">
            <Descriptions.Item label="名称">{data?.name}</Descriptions.Item>
            <Descriptions.Item label="ID">{data?.id}</Descriptions.Item>
            <Descriptions.Item label="创建时间">{data?.ctime}</Descriptions.Item>
          </Descriptions>
          <PermissionList readonly value={data?.permissions} />
        </Skeleton>
      </Card>
    </>
  )
}

export default RoleDetail
