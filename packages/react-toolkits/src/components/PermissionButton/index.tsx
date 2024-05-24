import type { ButtonProps } from 'antd'
import { Button, Tooltip } from 'antd'
import type { FC, PropsWithChildren } from 'react'
import { useTranslation } from '../../hooks/i18n'
import { usePermissions } from '../../hooks/permission'

export interface PermissionButtonProps extends ButtonProps {
  code: string | string[]
  showLoading?: boolean
  isGlobal?: boolean
}

const PermissionButton: FC<PropsWithChildren<PermissionButtonProps>> = props => {
  const { children, code, showLoading, isGlobal, disabled, ...restProps } = props
  const { data, isLoading } = usePermissions(Array.isArray(code) ? code : [code], isGlobal)
  const t = useTranslation()

  if (isLoading) {
    return (
      <Button loading={showLoading} disabled={!showLoading} {...restProps}>
        {children}
      </Button>
    )
  }

  if (!Object.values(data ?? {})?.some(Boolean)) {
    return (
      <Tooltip defaultOpen={false} title={t('global.noEntitlement')}>
        <Button disabled {...restProps}>
          {children}
        </Button>
      </Tooltip>
    )
  }

  return (
    <Button disabled={disabled} {...restProps}>
      {children}
    </Button>
  )
}

export default PermissionButton
