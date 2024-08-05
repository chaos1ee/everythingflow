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
  switching: boolean
  setGame: (id: string | number) => Promise<void>
  refetchGames: () => Promise<void>
  setSwitching: (switching: boolean) => void
}
