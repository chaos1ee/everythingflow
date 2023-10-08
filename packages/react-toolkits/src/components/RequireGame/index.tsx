import { Card, Empty } from 'antd'
import type { FC, PropsWithChildren } from 'react'
import { useTranslation } from '@/utils/i18n'
import { useGameStore } from '@/components/GameSelect'
import { useToolkitsContext } from '@/components/ContextProvider'

const RequireGame: FC<PropsWithChildren> = props => {
  const { children } = props
  const { usePermissionV2, isGlobalNS } = useToolkitsContext()
  const { game } = useGameStore()
  const t = useTranslation()

  if (usePermissionV2 && !isGlobalNS && !game) {
    return (
      <Card>
        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={t('noEntitlement')} />
      </Card>
    )
  }

  return <>{children}</>
}

export default RequireGame
