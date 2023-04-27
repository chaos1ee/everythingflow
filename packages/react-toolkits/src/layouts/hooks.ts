import { useContext } from 'react'
import { GameContext } from './contexts'

export function useGames() {
  return useContext(GameContext)
}
