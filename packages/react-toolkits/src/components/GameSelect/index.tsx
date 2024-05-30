import { Select, Space, Typography } from 'antd'
import { useSWRConfig } from 'swr'
import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { useTranslation } from '../../hooks/i18n'
import { useTokenStore } from '../../stores/token'
import { mixedStorage } from '../../utils/storage'
import { contextStore, useToolkitsContext } from '../ContextProvider'

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
  switching: boolean // 切换游戏中
  setSwitching: (switching: boolean) => void
}

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      game: null,
      games: [],
      isLoading: false,
      switching: false,
      setSwitching: switching => {
        set({ switching })
      },
      setGame: id => {
        const matchGame = (get().games ?? []).find(item => item.id === id)
        set({ game: matchGame ?? null })
      },
      fetchGames: () => {
        const token = useTokenStore.getState().token
        const isPermissionApiV2 = contextStore.getState().usePermissionApiV2

        if (token && isPermissionApiV2) {
          set({ isLoading: true })

          fetch('/api/usystem/game/all', {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
          })
            .then(response => {
              if (response.ok) {
                return response.json()
              }
              throw new Error('Network response was not ok.')
            })
            .then((json: { code: number; data: Game[]; msg: string }) => {
              set({ games: json.data })
            })
            .finally(() => {
              set({ isLoading: false })
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

useTokenStore.subscribe((state, prevState) => {
  if (state.token !== prevState.token) {
    // FIXME: 因为请求会在 Mock Service Worker 启动前发出，所以这里需要延迟一段时间
    setTimeout(() => {
      useGameStore.getState().fetchGames()
    }, 400)
  }
})

useTokenStore.persist.rehydrate()

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

const GameSelect = () => {
  const t = useTranslation()
  const { gameFilter } = useToolkitsContext()
  const { game, games, isLoading, setGame, setSwitching } = useGameStore()
  const { mutate } = useSWRConfig()

  const options = (games ?? [])
    ?.filter(item => gameFilter?.(item) ?? true)
    ?.map(item => ({
      label: item.name,
      value: item.id,
    }))

  const onGameChange = async (id: string) => {
    setSwitching(true)
    // FIXME: 切换游戏时，request 函数内的 useGameStore.getState().game 会获取到旧值，这里暂时延迟一段时间。后续优化。
    await sleep(100)
    // 清除 SWR 缓存
    await mutate(
      key => {
        return !(typeof key === 'string' && key.startsWith('/api/usystem/game/all'))
      },
      { revalidateAll: false },
    )
    setGame(id)
    setSwitching(false)
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
