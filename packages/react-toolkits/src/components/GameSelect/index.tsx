import { Select, Space, Typography } from 'antd'
import { useCallback, useEffect, useMemo } from 'react'
import { useSWRConfig } from 'swr'
import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { useTranslation } from '../../hooks/i18n'
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
  isLoading: boolean
  game: Game | null
  games: Game[]
  setGame: (id: string) => void
  setGames: (games: Game[]) => void
  clearGame: () => void
  setIsLoading: (isLoading: boolean) => void
}

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      isLoading: true,
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
      setIsLoading: (isLoading: boolean) => {
        set({ isLoading })
      },
    }),
    {
      name: 'game',
      storage: createJSONStorage(() => mixedStorage),
      partialize: state => ({ game: state.game }),
      onRehydrateStorage: () => {
        console.log('Game store hydration starts')
        return (state, error) => {
          if (state && !error) {
            // 因为 Mock Service Worker 需要时间启动，所以这里需要延迟一下
            setTimeout(() => {
              request<Game[]>(`/api/usystem/game/all`, { isGlobalNS: true }).then(response => {
                state.setGames(response.data)
                state.setIsLoading(false)
              })
            }, 800)
          }
        }
      },
    },
  ),
)

const GameSelect = () => {
  const t = useTranslation()
  const { gameFilter } = useToolkitsContext()
  const { game, games, isLoading, setGame, clearGame } = useGameStore()
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
