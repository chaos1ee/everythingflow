import { Select, Space, Typography } from 'antd'
import { useEffect } from 'react'
import { useToolkitsContext } from '../contextProvider'
import { useTranslation } from '../locale'
import { useGameStore } from './store'

const { Text } = Typography

const GameSelect = () => {
  const { t } = useTranslation()
  const { gameFilter } = useToolkitsContext()
  const { game, games, isLoading, refetchGames, setGame } = useGameStore()

  useEffect(() => {
    refetchGames()
  }, [])

  const options = (games ?? [])
    ?.filter(item => gameFilter?.(item) ?? true)
    ?.map(item => ({
      label: item.name,
      value: String(item.id),
    }))

  const onGameChange = async (id: string) => {
    setGame(id)
  }

  return (
    <Space>
      <Text>{t('GameSelect.label')}</Text>
      <Select
        showSearch
        optionFilterProp="label"
        value={String(game?.id ?? '')}
        placeholder={t('GameSelect.placeholder')}
        loading={isLoading}
        style={{ width: '200px' }}
        options={options}
        onChange={onGameChange}
      />
    </Space>
  )
}

export default GameSelect
