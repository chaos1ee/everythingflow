import { Card, Empty } from 'antd'
import type { FC, PropsWithChildren } from 'react'
import { useTranslation } from '../../hooks/i18n'
import { useToolkitsContext } from '../ContextProvider'
import { useGameStore } from '../GameSelect'

const RequireGame: FC<PropsWithChildren> = props => {
  const { children } = props
  const { usePermissionApiV2, hideGameSelect } = useToolkitsContext()
  const { game } = useGameStore()
  const t = useTranslation()

  if (usePermissionApiV2 && !hideGameSelect) {
    if (game) {
      // 切换游戏时，重新渲染 children
      return <div key={game.id}>{children}</div>
    } else {
      return (
        <Card>
          <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={t('RequireGame.description')} />
        </Card>
      )
    }
  }

  return children
}

export default RequireGame
