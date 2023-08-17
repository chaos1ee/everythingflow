import useSWR from 'swr'

export function useInstances() {
  return useSWR<{ name: string; id: string }[]>({
    method: 'GET',
    url: '/api/instances',
  })
}

export function useDatabases(instanceId: string) {
  return useSWR<{ name: string; id: string }[]>(
    instanceId
      ? {
          method: 'GET',
          url: '/api/databases',
          params: {
            instanceId,
          },
        }
      : null,
  )
}
