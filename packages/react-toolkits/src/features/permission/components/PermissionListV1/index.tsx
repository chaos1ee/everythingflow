import { Skeleton, Typography } from 'antd'
import { useAllPermissions } from '../../hooks'
import PermissionCollapse from '../PermissionCollapse'
import type { RoleV1 } from '../../types'
import type { PermissionListPropsBase } from '../PermissionList'
import type { FC } from 'react'
import { useTranslation } from '@/locales'

const { Text } = Typography

interface PermissionListV1Props extends PermissionListPropsBase {
  value?: RoleV1['permissions']
  onChange?: (checkedValue: RoleV1['permissions']) => void
}

const PermissionListV1: FC<PermissionListV1Props> = props => {
  const { expand = true, value, readonly, onChange } = props
  const { data: permissions, isLoading, error } = useAllPermissions()
  const t = useTranslation()

  if (error) {
    return (
      <div className="flex justify-center">
        <Text type="danger">{t('PermissionList.failedDescription')}</Text>
      </div>
    )
  }

  return (
    <Skeleton active loading={isLoading}>
      <PermissionCollapse
        value={value}
        permissions={permissions}
        readonly={readonly}
        expand={expand}
        onChange={newValue => {
          onChange?.(newValue)
        }}
      />
    </Skeleton>
  )
}

export default PermissionListV1
