import { Select, Space, Typography } from 'antd'
import { useCallback, useMemo } from 'react'
import useSWRImmutable from 'swr/immutable'
import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { mixedStorage } from '@/utils/storage'
import { useTranslation } from '@/locales'
import { useToolkitsContext } from '@/components/ContextProvider'
import { useTokenStore } from '@/stores/token'
import { request } from '@/utils/request'

const { Text } = Typography

export interface Game {
  id: string
  name: string
  area: 'cn' | 'global'
  Ctime: string
}

export interface GameState {
  game: Game | null
  setGame: (game: Game) => void
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
  const { usePermissionV2 } = useToolkitsContext()
  const user = useTokenStore(state => state.getUser())

  const { data, isLoading } = useSWRImmutable(
    usePermissionV2 && user ? `/api/usystem/game/all?user=${user.authorityId}` : null,
    url => request<Game[]>(url, undefined, true).then(response => response.data),
  )

  return {
    games: data,
    isLoading,
  }
}

const GameSelect = () => {
  const { onlyDomesticGames } = useToolkitsContext()
  const { game, setGame } = useGameStore()
  const { games, isLoading } = useGames()
  const t = useTranslation()

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
