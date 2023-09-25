import type { ButtonProps } from 'antd'
import { Button, Tooltip } from 'antd'
import type { FC, PropsWithChildren } from 'react'
import { useTranslation } from '@/locales'
import { usePermission } from '@/hooks/permission'

export interface PermissionButtonProps extends Omit<ButtonProps, 'disabled'> {
  code: string
  showLoading?: boolean
}

const PermissionButton: FC<PropsWithChildren<PermissionButtonProps>> = props => {
  const { children, code, showLoading, ...restProps } = props
  const { accessible, isValidating } = usePermission(code)
  const t = useTranslation()

  if (isValidating) {
    return (
      <Button loading={showLoading} disabled={!showLoading} {...restProps}>
        {children}
      </Button>
    )
  }

  if (!accessible) {
    return (
      <Tooltip defaultOpen={false} title={t('noEntitlement')}>
        <Button disabled {...restProps}>
          {children}
        </Button>
      </Tooltip>
    )
  }

  return <Button {...restProps}>{children}</Button>
}

export default PermissionButton
