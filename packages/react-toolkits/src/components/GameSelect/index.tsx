import { Select, Space, Typography } from 'antd'
import { useSWRConfig } from 'swr'
import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { useTranslation } from '../../hooks/i18n'
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
  isLoading: boolean
  setGame: (id: string) => void
  fetchGames: () => void
}

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      game: null,
      games: [],
      isLoading: false,
      setGame: id => {
        const matchGame = (get().games ?? []).find(item => item.id === id)
        set({ game: matchGame ?? null })
      },
      fetchGames: () => {
        set({ isLoading: true })

        fetch('/api/usystem/game/all', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        })
          .then(response => {
            if (response.ok) {
              return response.json()
            }
          })
          .then((json: { code: number; data: Game[]; msg: string }) => {
            set({ games: json.data })
          })
          .finally(() => {
            set({ isLoading: false })
          })
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
            // 因为 Mock Service Worker 需要时间启动，所以这里需要延迟一段时间
            setTimeout(() => {
              state.fetchGames()
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
  const { game, games, isLoading, setGame } = useGameStore()
  const { mutate } = useSWRConfig()

  const options = (games ?? [])
    ?.filter(item => gameFilter?.(item) ?? true)
    ?.map(item => ({
      label: item.name,
      value: item.id,
    }))

  const clearCache = async () => {
    await mutate(key => {
      return !(typeof key === 'string' && key.startsWith('/api/usystem/game/all'))
    })
  }

  const onGameChange = async (id: string) => {
    await clearCache()
    setGame(id)
  }

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
