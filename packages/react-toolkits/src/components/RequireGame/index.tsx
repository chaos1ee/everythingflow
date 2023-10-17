import { Card, Result } from 'antd'
import type { FC, PropsWithChildren } from 'react'
import { useTranslation } from '@/utils/i18n'
import { useGameStore } from '@/components/GameSelect'
import { useToolkitsContext } from '@/components/ContextProvider'

const RequireGame: FC<PropsWithChildren> = props => {
  const { children } = props
  const { usePermissionV2, hideGameSelect } = useToolkitsContext()
  const { game } = useGameStore()
  const t = useTranslation()

  if (usePermissionV2 && !hideGameSelect && !game) {
    return (
      <Card>
        <Result status="info" title={t('RequireGame.description')} />
      </Card>
    )
  }

  return <>{children}</>
}

export default RequireGame
