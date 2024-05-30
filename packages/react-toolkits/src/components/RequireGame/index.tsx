import { Card, Empty, Spin } from 'antd'
import { type FC, type PropsWithChildren } from 'react'
import { useTranslation } from '../../hooks/i18n'
import { useToolkitsContext } from '../ContextProvider'
import { useGameStore } from '../GameSelect'

const RequireGame: FC<PropsWithChildren> = props => {
  const { children } = props
  const { usePermissionApiV2, hideGameSelect } = useToolkitsContext()
  const { game, switching } = useGameStore()
  const t = useTranslation()

  if (switching) {
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
