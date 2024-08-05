import { Select, Space, Typography } from 'antd'
import { useEffect } from 'react'
import { useSWRConfig } from 'swr'
import { useToolkitsContext } from '../contextProvider'
import { useTranslation } from '../locale'
import { useGameStore } from './store'

const { Text } = Typography

const GameSelect = () => {
  const { t } = useTranslation()
  const { gameFilter } = useToolkitsContext()
  const { game, games, isLoading, setGame, refetchGames, setSwitching } = useGameStore()
  const { mutate } = useSWRConfig()

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
    setSwitching(true)
    await mutate(key => !(typeof key === 'string' && key.startsWith('/api/usystem/game/all')), undefined, {
      revalidate: false,
    })
    setGame(id)
    setSwitching(false)
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
