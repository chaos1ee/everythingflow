export interface VersionListItem {
  id: string
  name: string
  comment?: string
  ctime: string
  auth: string
}

export interface TableListItem {
  id: string
  name: string
  ctime: string
}

export interface VersionRecordListItem {
  id: number
  version_id: number
  auth: string
  type: number
  comment?: string
  ctime: string
  type_name: string
}

export interface TableData {
  title: string[][]
  data: string[][]
}

export interface TableCellLog {
  operate_id: number
  operate_type: number
  data_value: string
  auth: string
  ctime: string
  type_name: string
  diff: string
}
