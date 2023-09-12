import { Select, Space, Typography } from 'antd'
import { useCallback, useMemo } from 'react'
import { useTokenStore } from '@/stores'
import useSWRImmutable from 'swr/immutable'
import { useGameStore, useToolkitContext } from '@/components'
import type { Game } from './types'
import { request } from '@/utils'

const { Text } = Typography

function useGames() {
  const { usePermissionV2 } = useToolkitContext()
  const user = useTokenStore(state => state.getUser())

  const { data, isLoading } = useSWRImmutable<Game[]>(
    usePermissionV2 && user ? `/api/usystem/game/all?user=${user.authorityId}` : null,
    url => request(url, undefined, true),
  )

  return {
    games: data,
    isLoading,
  }
}

const GameSelect = () => {
  const { onlyDomesticGames } = useToolkitContext()
  const { game, setGame } = useGameStore()
  const { games, isLoading } = useGames()

  const options = useMemo(
    () =>
      (games ?? [])
        .filter(item => !onlyDomesticGames || item.area === 'cn')
        ?.map(item => ({
          label: item.name,
          value: item.id,
        })),
    [games, onlyDomesticGames],
  )

  const onGameChange = useCallback(
    async (id: string) => {
      const matchGame = (games ?? []).find(item => item.id === id)
      if (matchGame) {
        setGame(matchGame)
      }
    },
    [games, setGame],
  )

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
