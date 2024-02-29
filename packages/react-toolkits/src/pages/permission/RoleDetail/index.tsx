import { Breadcrumb, Card, Descriptions, Skeleton } from 'antd'
import { Link, useParams } from 'react-router-dom'
import { PermissionList, useRole } from '../../../features/permission'
import { useTranslation } from '../../../hooks/i18n'

const RoleDetail = () => {
  const params = useParams()
  const { data, isLoading } = useRole(params.name as string)
  const t = useTranslation()

  return (
    <>
      <Breadcrumb
        style={{ marginBottom: 24 }}
        items={[
          {
            key: '1',
            title: <Link to="..">{t('global.role')}</Link>,
          },
          {
            key: '2',
            title: params.name,
          },
        ]}
      />
      <Card title={t('RoleDetail.title')}>
        <Skeleton loading={isLoading}>
          <Descriptions column={3} layout="vertical">
            <Descriptions.Item label={t('global.name')}>{data?.name}</Descriptions.Item>
            <Descriptions.Item label="ID">{data?.id}</Descriptions.Item>
            <Descriptions.Item label={t('global.creationTime')}>{data?.ctime}</Descriptions.Item>
          </Descriptions>
          <PermissionList readonly value={data?.permissions} />
        </Skeleton>
      </Card>
    </>
  )
}

export default RoleDetail
