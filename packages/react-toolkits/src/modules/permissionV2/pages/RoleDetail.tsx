import { Breadcrumb, Card, Descriptions, Skeleton } from 'antd'
import { Link, useParams } from 'react-router-dom'
import { useRole } from '../hooks'
import PermissionList from '../components/PermissionList'

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
            <Descriptions.Item label="权限" span={3}>
              <PermissionList readonly value={data?.permissions} />
            </Descriptions.Item>
          </Descriptions>
        </Skeleton>
      </Card>
    </>
  )
}

export default RoleDetail
