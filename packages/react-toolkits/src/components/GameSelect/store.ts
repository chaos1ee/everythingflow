import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import type { Game } from './types'
import { mixedStorage } from '@/utils/storage'

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
