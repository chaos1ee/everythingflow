import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { request } from '../../utils/request'
import { mixedStorage } from '../../utils/storage'
import type { Game, GameState } from './types'

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      initialized: false,
      isLoading: false,
      game: null,
      games: [],
      async setGame(id) {
        const { initialized, refetchGames } = get()

        if (!initialized) {
          await refetchGames()
        }

        const matchedGame = (get().games ?? []).find(item => String(item.id) === String(id))
        set({ game: matchedGame ?? null })
      },
      async refetchGames() {
        if (!get().isLoading) {
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
