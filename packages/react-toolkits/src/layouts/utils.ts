import type { GameType } from './types'

export const findGame = (games: GameType[], id: string) => {
  return games.find(item => item.id === id) as GameType
}
