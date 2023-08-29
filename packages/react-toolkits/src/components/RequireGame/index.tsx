import { Card, Empty } from 'antd'
import type { FC, PropsWithChildren } from 'react'
import { useReactToolkitsContext } from '@/components'

const RequireGame: FC<PropsWithChildren> = props => {
  const { children } = props
  const { game, isPermissionV2, isGlobalNS } = useReactToolkitsContext(state => state)

  if (isPermissionV2 && !isGlobalNS && !game) {
    return (
      <Card>
        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="请选择游戏" />
      </Card>
    )
  }

  return <>{children}</>
}

export default RequireGame
