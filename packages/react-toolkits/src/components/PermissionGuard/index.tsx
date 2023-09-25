import { Result, Spin } from 'antd'
import type { FC, PropsWithChildren } from 'react'
import { useTranslation } from '@/locales'
import { usePermission } from '@/hooks/permission'

export interface PermissionGuardProps {
  code: string
}

const PermissionGuard: FC<PropsWithChildren<PermissionGuardProps>> = props => {
  const { code, children } = props
  const { accessible, isValidating } = usePermission(code)
  const t = useTranslation()

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
    return <Result status="403" subTitle={t('noEntitlement')} />
  }

  return <>{children}</>
}

export default PermissionGuard
