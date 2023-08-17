import { Select, Space, Typography } from 'antd'
import { useCallback, useMemo } from 'react'
import { useTokenStore } from '@/stores'
import useSWRImmutable from 'swr/immutable'
import { useReactToolkitsContext } from '@/components'
import { useSWRConfig } from 'swr'

const { Text } = Typography

export interface GameType {
  id: string
  name: string
  area: 'cn' | 'global'
  Ctime: string
}

function useGames() {
  const { isPermissionV2, isGlobalNS } = useReactToolkitsContext(state => state)
  const user = useTokenStore(state => state.getUser())

  const { data, isLoading } = useSWRImmutable<GameType[]>(
    isPermissionV2 && !isGlobalNS && user
      ? {
          method: 'GET',
          url: '/api/usystem/game/all',
          params: { user: user.authorityId },
          headers: {
            'App-ID': 'global',
          },
        }
      : null,
  )

  return {
    games: data,
    isLoading,
  }
}

const GameSelect = () => {
  const { game, setGame, isGlobalNS, isPermissionV2 } = useReactToolkitsContext(state => state)
  const { games, isLoading } = useGames()
  const { mutate } = useSWRConfig()

  const options = useMemo(
    () =>
      games?.map(item => ({
        label: item.name,
        value: item.id,
      })),
    [games],
  )

  const onGameChange = useCallback(
    async (id: string) => {
      const matchGame = (games ?? []).find(item => item.id === id) ?? null
      setGame(matchGame)
    },
    [games, setGame, mutate],
  )

  if (!isPermissionV2 || isGlobalNS) {
    return null
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
        style={{ width: '200px' }}
        options={options}
        onChange={onGameChange}
      />
    </Space>
  )
}

export default GameSelect
