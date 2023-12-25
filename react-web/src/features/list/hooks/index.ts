import { request } from 'react-toolkits'
import useSWRMutation from 'swr/mutation'

export function useRemoveHistoricalMsgListItem() {
  return useSWRMutation(
    '/adminApi/msgDel',
    (
      url,
      {
        arg,
      }: {
        arg: {
          project_id: number
          message_id: number
        }
      },
    ) => {
      return request(url, { method: 'DELETE', params: arg })
    },
  )
}
