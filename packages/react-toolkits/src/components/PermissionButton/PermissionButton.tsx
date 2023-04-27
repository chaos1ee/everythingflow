import type { ButtonProps } from 'antd'
import { Button, Tooltip } from 'antd'
import type { FC, PropsWithChildren } from 'react'
import { usePermission } from '../../hooks'

interface TooltipButtonProps extends Omit<ButtonProps, 'disabled' | 'loading'> {
  code: string
  showLoading?: boolean
}

const PermissionButton: FC<PropsWithChildren<TooltipButtonProps>> = props => {
  const { children, code, showLoading, ...restProps } = props
  const { accessible, isChecking } = usePermission(code)

  if (isChecking) {
    return (
      <Button loading={showLoading} disabled={!showLoading} {...restProps}>
        {children}
      </Button>
    )
  }

  if (!accessible) {
    return (
      <Tooltip defaultOpen={false} title="未授权，请联系管理员进行授权">
        <Button disabled {...restProps}>
          {children}
        </Button>
      </Tooltip>
    )
  }

  return <Button {...restProps}>{children}</Button>
}

export default PermissionButton
