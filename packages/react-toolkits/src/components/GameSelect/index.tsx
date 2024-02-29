import { Select, Space, Typography } from 'antd'
import { useCallback, useEffect, useMemo } from 'react'
import { useSWRConfig } from 'swr'
import useSWRImmutable from 'swr/immutable'
import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { useTranslation } from '../../hooks/i18n'
import { useTokenStore } from '../../stores/token'
import { request } from '../../utils/request'
import { mixedStorage } from '../../utils/storage'
import { useToolkitsContext } from '../ContextProvider'

const { Text } = Typography

export interface Game {
  id: string
  name: string
  area: 'cn' | 'global'
  Ctime: string
}

export interface GameState {
  game: Game | null
  games: Game[]
  setGame: (id: string) => void
  setGames: (games: Game[]) => void
  clearGame: () => void
}

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      game: null,
      games: [],
      setGame: id => {
        const matchGame = (get().games ?? []).find(item => item.id === id)
        set({ game: matchGame ?? null })
      },
      setGames: games => set({ games }),
      clearGame: () => {
        set({ game: null })
      },
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
  const { setGames } = useGameStore()

  return useSWRImmutable(
    usePermissionApiV2 && user ? `/api/usystem/game/all?user=${user.authorityId}` : null,
    url => request<Game[]>(url, { isGlobalNS: true }).then(response => response.data),
    {
      onSuccess: data => {
        setGames(data)
      },
    },
  )
}

const GameSelect = () => {
  const t = useTranslation()
  const { gameFilter } = useToolkitsContext()
  const { game, setGame, clearGame } = useGameStore()
  const { data: games, isLoading } = useGames()
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
      setGame(id)
      clearCache()
    },
    [games, clearCache],
  )

  useEffect(() => {
    if (!isLoading && (options.length === 0 || !options.some(item => item.value === game?.id))) {
      clearGame()
    }
  }, [isLoading, game, options])

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
