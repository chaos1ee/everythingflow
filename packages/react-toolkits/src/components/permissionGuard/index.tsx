import { Result, Spin } from 'antd'
import type { FC, PropsWithChildren } from 'react'
import { useTranslation } from '../locale'
import { usePermission } from '../../hooks/permission'

export interface PermissionGuardProps {
  code: string
  isGlobal?: boolean
}

const PermissionGuard: FC<PropsWithChildren<PermissionGuardProps>> = props => {
  const { code, isGlobal, children } = props
  const { accessible, isValidating } = usePermission(code, isGlobal)
  const { t } = useTranslation()

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
    return <Result status="403" subTitle={t('global.noEntitlement')} />
  }

  return <>{children}</>
}

export default PermissionGuard
