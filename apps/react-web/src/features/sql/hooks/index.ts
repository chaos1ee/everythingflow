import useSWR from 'swr'

export function useDatabases(instanceId: string) {
  return useSWR(
    instanceId
      ? {
          method: 'GET',
          url: '/api/database/list',
          params: {
            instanceId,
          },
        }
      : null,
  )
}
