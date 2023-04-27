import { Select, Space, Typography } from 'antd'
import { useGames } from './hooks'
import { findGame } from './utils'

const { Text } = Typography

const GameSelector = () => {
  const { games, isLoading, game, setGame } = useGames()

  const onGameChange = (value: string) => {
    setGame(findGame(games, value))
  }

  return (
    <Space>
      <Text>当前游戏</Text>
      <Select
        showSearch
        optionFilterProp="label"
        value={game?.id}
        placeholder="请选择游戏"
        loading={isLoading}
        style={{ width: '150px' }}
        options={games?.map(item => ({ label: item.name, value: item.id }))}
        onChange={onGameChange}
      />
    </Space>
  )
}

export default GameSelector
