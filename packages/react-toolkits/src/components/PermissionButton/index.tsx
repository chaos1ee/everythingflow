import type { ButtonProps } from 'antd'
import { Button, Tooltip } from 'antd'
import type { FC, PropsWithChildren } from 'react'
import { useTranslation } from '../../hooks/i18n'
import { usePermission } from '../../hooks/permission'

export interface PermissionButtonProps extends Omit<ButtonProps, 'disabled'> {
  code: string
  showLoading?: boolean
  isGlobalNS?: boolean
}

const PermissionButton: FC<PropsWithChildren<PermissionButtonProps>> = props => {
  const { children, code, showLoading, isGlobalNS, ...restProps } = props
  const { accessible, isLoading } = usePermission(code, { isGlobalNS })
  const t = useTranslation()

  if (isLoading) {
    return (
      <Button loading={showLoading} disabled={!showLoading} {...restProps}>
        {children}
      </Button>
    )
  }

  if (!accessible) {
    return (
      <Tooltip defaultOpen={false} title={t('global.noEntitlement')}>
        <Button disabled {...restProps}>
          {children}
        </Button>
      </Tooltip>
    )
  }

  return <Button {...restProps}>{children}</Button>
}

export default PermissionButton
