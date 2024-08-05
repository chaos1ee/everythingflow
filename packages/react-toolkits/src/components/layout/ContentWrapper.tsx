import * as Antd from 'antd'
import { Card, Empty } from 'antd'
import { Fragment, type FC, type PropsWithChildren } from 'react'
import { useToolkitsContext } from '../contextProvider'
import { useGameStore } from '../gameSelect'
import { useTranslation } from '../locale'

const { Spin } = Antd

// FIXME: 切换游戏时有概率导致页面内的数据请求不触发，需要进一步排查。
const ContentWrapper: FC<PropsWithChildren> = props => {
  const { children } = props
  const { usePermissionApiV2, hideGameSelect } = useToolkitsContext()
  const { game, isLoading, switching } = useGameStore()
  const { t } = useTranslation()

  if (isLoading || switching) {
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
    if (!game) {
      return (
        <Card>
          <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={t('RequireGame.description')} />
        </Card>
      )
    } else {
      return <Fragment key={game.id}>{children}</Fragment>
    }
  }

  return children
}

export default ContentWrapper
