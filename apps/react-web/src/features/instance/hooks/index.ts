import { useHttpClient } from 'react-toolkits'
import useSWRMutation from 'swr/mutation'
import type { DatabaseType, InstanceTreeNode } from '~/features/instance'
import useSWRImmutable from 'swr/immutable'

export function useTreeNodes(parentPath?: string, dbType?: DatabaseType) {
  return useSWRImmutable<InstanceTreeNode>({
    url: '/api/instance/tree',
    params: {
      parent_path: parentPath,
      db_type: dbType,
    },
  })
}

export function useAddDirectory() {
  const httpClient = useHttpClient()
  return useSWRMutation(
    '/api/instance/add_leaf',
    (
      url,
      {
        arg,
      }: {
        arg: {
          parent: string
          name: string
        }
      },
    ) => httpClient.post(url, arg),
  )
}

export function useAddInstance() {
  const httpClient = useHttpClient()
  return useSWRMutation(
    '/api/instance/add_leaf',
    (
      url,
      {
        arg,
      }: {
        arg: {
          parent_path: string
          db_type: DatabaseType
          name: string
          host: string
          port: number
          username: string
          password: string
          dsn?: string
        }
      },
    ) => httpClient.post(url, arg),
  )
}
