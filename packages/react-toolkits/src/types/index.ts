/* eslint-disable @typescript-eslint/no-explicit-any */
export interface ListResponse<T = any> {
  list: T[]
  total: number
}

export type Locale = {
  global: {
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
    username: string
    password: string
    label: string
    method: string
    route: string
    request: string
    response: string
    add: string
    signIn: string
  }
  SignIn: {
    title: string
    thirdParty: string
    signInWithIDass: string
    notRegistered: string
    welcome: string
  }
  NotFound: {
    subTitle: string
    buttonText: string
  }
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
    signOutText: string
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
  InfiniteList: {
    loadingText: string
    reachEndText: string
    loadMoreText: string
  }
}
