import * as Antd from 'antd'
import { Empty } from 'antd'
import { type FC, type PropsWithChildren } from 'react'
import { useToolkitsContext } from '../contextProvider'
import { useGameStore } from '../gameSelect'
import { useTranslation } from '../locale'

const { Spin } = Antd

const ContentWrapper: FC<PropsWithChildren> = props => {
  const { children } = props
  const { usePermissionApiV2, hideGameSelect } = useToolkitsContext()
  const { game, isLoading } = useGameStore()
  const { t } = useTranslation()

  if (isLoading) {
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

  if (usePermissionApiV2 && !hideGameSelect && !game) {
    return <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={t('RequireGame.description')} />
  }

  return children
}

export default ContentWrapper
