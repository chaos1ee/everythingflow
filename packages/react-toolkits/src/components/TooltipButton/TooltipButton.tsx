import type { ButtonProps } from 'antd'
import { Button, Tooltip } from 'antd'
import type { FC, PropsWithChildren } from 'react'
import { useTranslation } from 'react-i18next'

const TooltipButton: FC<PropsWithChildren<ButtonProps>> = ({ children, disabled, loading, ...restProps }) => {
  const { t } = useTranslation()

  if (loading) {
    return (
      <Button loading {...restProps}>
        {children}
      </Button>
    )
  }

  if (disabled) {
    return (
      <Tooltip defaultOpen={false} title={t('not_authorized_msg')}>
        <Button disabled {...restProps}>
          {children}
        </Button>
      </Tooltip>
    )
  }

  return <Button {...restProps}>{children}</Button>
}

export default TooltipButton
