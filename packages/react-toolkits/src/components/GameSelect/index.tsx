import { Select, Space, Typography } from 'antd'
import { useEffect } from 'react'
import { useSWRConfig } from 'swr'
import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { useTranslation } from '../../hooks/i18n'
import { request } from '../../utils/request'
import { mixedStorage } from '../../utils/storage'
import { useToolkitsContext } from '../ContextProvider'

const { Text } = Typography

export interface Game {
  id: string | number
  name: string
  area: 'cn' | 'global'
  Ctime: string
}

export interface GameState {
  initialized: boolean
  game: Game | null
  games: Game[]
  isLoading: boolean
  setGame: (id: string | number) => Promise<void>
  refetchGames: () => Promise<void>
}

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      initialized: false,
      game: null,
      games: [],
      isLoading: false,
      setGame: async id => {
        const { initialized, refetchGames } = get()

        if (!initialized) {
          await refetchGames()
        }

        const matchedGame = (get().games ?? []).find(item => String(item.id) === String(id))
        set({ game: matchedGame ?? null })
      },
      refetchGames: async () => {
        try {
          set({ isLoading: true })
          const response = await request<Game[]>('/api/usystem/game/all')
          set({ games: response.data })
        } finally {
          set({
            initialized: true,
            isLoading: false,
          })
        }
      },
    }),
    {
      name: 'game',
      storage: createJSONStorage(() => mixedStorage),
      partialize: state => ({ game: state.game }),
    },
  ),
)

const GameSelect = () => {
  const t = useTranslation()
  const { gameFilter } = useToolkitsContext()
  const { game, games, isLoading, setGame, refetchGames } = useGameStore()
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
    // 清除 SWR 缓存
    setGame(id)
    await mutate(
      key => {
        return !(typeof key === 'string' && key.startsWith('/api/usystem/game/all'))
      },
      undefined,
      { revalidate: true },
    )
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
