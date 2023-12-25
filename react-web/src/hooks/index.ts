import { request, usePermission } from 'react-toolkits'
import useSWRImmutable from 'swr/immutable'

export function useGlobalConfig() {
  const { accessible } = usePermission('3005')
  const { data, isLoading } = useSWRImmutable(accessible ? '/adminApi/project/simple' : null, url =>
    request<{
      group_type: Record<string, string>
      project: {
        project_id: number
        project_name: string
      }[]
    }>(url).then(response => response.data),
  )

  return {
    data,
    isLoading,
    accessible,
  }
}
