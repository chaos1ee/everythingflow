import { Card, Empty } from 'antd'
import type { FC, PropsWithChildren } from 'react'
import { useGameStore, useToolkitContextStore } from '@/components'

const RequireGame: FC<PropsWithChildren> = props => {
  const { children } = props
  const { usePermissionV2, isGlobalNS } = useToolkitContextStore(state => state)
  const { game } = useGameStore()

  if (usePermissionV2 && !isGlobalNS && !game) {
    return (
      <Card>
        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="请选择游戏" />
      </Card>
    )
  }

  return <>{children}</>
}

export default RequireGame
