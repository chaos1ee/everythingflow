export type DatabaseType = 'mysql' | 'redis'

export interface InstanceTreeNode {
  id: string
  name: string
  path: string
  db_type?: DatabaseType
  children?: InstanceTreeNode[]
}
