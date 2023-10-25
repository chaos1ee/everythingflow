import { Select, Space, Typography } from 'antd'
import { useCallback, useEffect, useMemo } from 'react'
import useSWRImmutable from 'swr/immutable'
import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { mixedStorage } from '@/utils/storage'
import { useTranslation } from '@/utils/i18n'
import { useToolkitsContext } from '@/components/ContextProvider'
import { useTokenStore } from '@/stores/token'
import { request } from '@/utils/request'
import { useSWRConfig } from 'swr'

const { Text } = Typography

export interface Game {
  id: string
  name: string
  area: 'cn' | 'global'
  Ctime: string
}

export interface GameState {
  game: Game | null
  setGame: (game: Game | null) => void
}

export const useGameStore = create<GameState>()(
  persist(
    set => ({
      game: null,
      setGame: game => set({ game }),
    }),
    {
      name: 'game',
      storage: createJSONStorage(() => mixedStorage),
      partialize: state => ({ game: state.game }),
    },
  ),
)

function useGames() {
  const { usePermissionApiV2 } = useToolkitsContext()
  const user = useTokenStore(state => state.getUser())

  const { data, isLoading } = useSWRImmutable(
    usePermissionApiV2 && user ? `/api/usystem/game/all?user=${user.authorityId}` : null,
    url => request<Game[]>(url, { isGlobalNS: true }).then(response => response.data),
  )

  return {
    games: data,
    isLoading,
  }
}

const GameSelect = () => {
  const t = useTranslation()
  const { gameFilter } = useToolkitsContext()
  const { game, setGame } = useGameStore()
  const { games, isLoading } = useGames()
  const { mutate } = useSWRConfig()

  const options = useMemo(
    () =>
      (games ?? [])
        ?.filter(item => !gameFilter || gameFilter(item))
        ?.map(item => ({
          label: item.name,
          value: item.id,
        })),
    [games, gameFilter],
  )

  const clearCache = useCallback(() => {
    mutate(key => {
      return !(typeof key === 'string' && key.startsWith('/api/usystem/game/all'))
    })
  }, [mutate])

  const onGameChange = useCallback(
    async (id: string) => {
      const matchGame = (games ?? []).find(item => item.id === id)
      if (matchGame) {
        setGame(matchGame)
        clearCache()
      }
    },
    [games, setGame, clearCache],
  )

  useEffect(() => {
    if (!isLoading && (options.length === 0 || !options.some(item => item.value === game?.id))) {
      setGame(null)
    }
  }, [isLoading, game, options, setGame])

  return (
    <Space>
      <Text>{t('GameSelect.label')}</Text>
      <Select
        showSearch
        optionFilterProp="label"
        value={game?.id}
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
