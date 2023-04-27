import type { Dispatch, SetStateAction } from 'react';
import { createContext } from 'react'
import type { GameType } from './types'

type GameContextType = {
  isLoading: boolean
  game: GameType | null
  games: GameType[]
  setGame: Dispatch<SetStateAction<GameType | null>>
}

const noop = () => {}

export const GameContext = createContext<GameContextType>({
  isLoading: true,
  game: null,
  games: [],
  setGame: noop,
})
