import type { FC, PropsWithChildren } from 'react'
import { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { GAME_ID_STORAGE_KEY } from '../constants'
import { useToken } from '../hooks'
import { createHttpClient } from '../libs/client'
import type { GameType } from './types'
import { findGame } from './utils'
import { GameContext } from './contexts'

const client = createHttpClient()

export const Providers: FC<PropsWithChildren> = ({ children }) => {
  const { token } = useToken()
  const [game, setGame] = useState<GameType | null>(null)

  const { data: games, isLoading } = useQuery({
    queryKey: ['/usystem/game/all'],
    queryFn: () => client.get<GameType[]>('/usystem/game/all', { headers: { 'app-id': 'global' } }),
    enabled: !!token,
    onSuccess(value) {
      setGame(findGame(value, sessionStorage.getItem(GAME_ID_STORAGE_KEY) ?? ''))
    },
  })

  const state = {
    isLoading,
    game,
    games: games ?? [],
    setGame,
  }

  useEffect(() => {
    sessionStorage.setItem(GAME_ID_STORAGE_KEY, localStorage.getItem(GAME_ID_STORAGE_KEY) ?? '')
  }, [])

  useEffect(() => {
    if (game) {
      // 页面多开时，每个页面需要有一个独立的 appId，所以需要使用 sessionStorage 来存储 appId。
      // 否则会导致页面头部的游戏选择器显示的游戏和实际传递给后端的游戏 ID 不一致的问题。
      sessionStorage.setItem(GAME_ID_STORAGE_KEY, game.id)
      localStorage.setItem(GAME_ID_STORAGE_KEY, game.id)
    }
  }, [game])

  return <GameContext.Provider value={state}>{children}</GameContext.Provider>
}
