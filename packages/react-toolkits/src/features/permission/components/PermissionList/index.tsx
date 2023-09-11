import type { RoleV1, RoleV2 } from '@/features/permission'
import type { FC } from 'react'
import PermissionListV1 from '../PermissionListV1'
import PermissionListV2 from '../PermissionListV2'
import { useToolkitContextStore } from '@/components'

export interface PermissionListPropsBase {
  expand?: boolean
  readonly?: boolean
}

interface PermissionListProps extends PermissionListPropsBase {
  value?: RoleV1['permissions'] | RoleV2['permissions']
  onChange?: (checkedValue: RoleV1['permissions'] | RoleV2['permissions']) => void
}

const PermissionList: FC<PermissionListProps> = (props: PermissionListProps) => {
  const { value } = props
  const { usePermissionV2 } = useToolkitContextStore(state => state)

  if (usePermissionV2) {
    return <PermissionListV2 {...props} value={value as RoleV2['permissions']} />
  }

  return <PermissionListV1 {...props} value={value as RoleV1['permissions']} />
}

export default PermissionList
