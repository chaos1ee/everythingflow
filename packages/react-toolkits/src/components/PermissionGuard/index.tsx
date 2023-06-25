import { Result, Spin } from 'antd'
import type { FC, PropsWithChildren } from 'react'
import { usePermission } from '../../hooks'

export interface PermissionGuardProps {
  code: string
}

const PermissionGuard: FC<PropsWithChildren<PermissionGuardProps>> = props => {
  const { code, children } = props
  const { accessible, isValidating } = usePermission(code)

  if (isValidating) {
    return (
      <Spin
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: 200,
        }}
      />
    )
  }

  if (!accessible) {
    return <Result status="403" subTitle="无权限，请联系管理员进行授权" />
  }

  return <>{children}</>
}

export default PermissionGuard
