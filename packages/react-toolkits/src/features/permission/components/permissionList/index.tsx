import type { FC } from 'react'
import { useToolkitsContext } from '../../../../components/contextProvider'
import type { RoleV1, RoleV2 } from '../../types'
import PermissionListV1 from '../permissionListV1'
import PermissionListV2 from '../permissionListV2'

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
  const { usePermissionApiV2 } = useToolkitsContext()

  return (
    <>
      {usePermissionApiV2 ? (
        <PermissionListV2 {...props} value={value as RoleV2['permissions']} />
      ) : (
        <PermissionListV1 {...props} value={value as RoleV1['permissions']} />
      )}
    </>
  )
}

export default PermissionList
