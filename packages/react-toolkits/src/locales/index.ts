// eslint-disable-next-line camelcase
import zh_CN from './zh_CN'
import { useContextStore } from '@/components/ContextProvider'
import { get, template } from 'lodash-es'

export type Locale = {
  noEntitlement: string
  name: string
  creationTime: string
  operation: string
  update: string
  edit: string
  delete: string
  selectAll: string
  game: string
  user: string
  role: string
  FilterFormWrapper: {
    confirmText: string
    resetText: string
  }
  FormModal: {
    confirmText: string
    cancelText: string
  }
  GameSelect: {
    label: string
    placeholder: string
  }
  RequireGame: {
    description: string
  }
  UserWidget: {
    logoutText: string
  }
  UserList: {
    createTitle: string
    createSuccessfully: string
    updateTitle: string
    updateSuccessfully: string
    deleteTitle: string
    deleteContent: string
    deleteSuccessfully: string
  }
  RoleList: {
    createTitle: string
    createSuccessfully: string
    updateTitle: string
    updateSuccessfully: string
    deleteTitle: string
    deleteContent: string
    deleteSuccessfully: string
  }
  PermissionList: {
    failedDescription: string
    baseSectionTitle: string
    gameSectionTitle: string
    gameSectionDescription: string
    gameSelectPlaceholder: string
    removeText: string
    addText: string
  }
  RoleDetail: {
    title: string
  }
}

type Join<K, P> = K extends string | number
  ? P extends string | number
    ? `${K}${'' extends P ? '' : '.'}${P}`
    : never
  : never

type Paths<T, D extends number = 10> = [D] extends [never]
  ? never
  : T extends object
  ? {
      [K in keyof T]-?: K extends string | number ? `${K}` | Join<K, Paths<T[K]>> : never
    }[keyof T]
  : ''

export function useTranslation() {
  const { locale = zh_CN } = useContextStore(state => state)

  return (key: Paths<Locale>, data?: Record<string, any>) => {
    const compiled = template(get(locale, key as string))
    return compiled(data)
  }
}
