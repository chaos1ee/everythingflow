import { usePermission } from '@/hooks'
import type { ButtonProps } from 'antd'
import { Button, Tooltip } from 'antd'
import type { FC, PropsWithChildren } from 'react'

export interface PermissionButtonProps extends Omit<ButtonProps, 'disabled'> {
  code: string
  showLoading?: boolean
}

const PermissionButton: FC<PropsWithChildren<PermissionButtonProps>> = props => {
  const { children, code, showLoading, ...restProps } = props
  const { accessible, isValidating } = usePermission(code)

  if (isValidating) {
    return (
      <Button loading={showLoading} disabled={!showLoading} {...restProps}>
        {children}
      </Button>
    )
  }

  if (!accessible) {
    return (
      <Tooltip defaultOpen={false} title="无权限，请联系管理员进行授权">
        <Button disabled {...restProps}>
          {children}
        </Button>
      </Tooltip>
    )
  }

  return <Button {...restProps}>{children}</Button>
}

export default PermissionButton
