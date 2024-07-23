import type { Locale } from '.'

const locale: Locale = {
  global: {
    noEntitlement: '无权限，请联系管理员。',
    name: '名称',
    creationTime: '创建时间',
    operation: '操作',
    update: '更新',
    edit: '编辑',
    delete: '删除',
    selectAll: '全选',
    game: '游戏',
    user: '用户',
    role: '角色',
    username: '用户名',
    password: '密码',
    label: '标签',
    method: '方法',
    route: '路由',
    request: '请求',
    response: '响应',
    add: '添加',
    signIn: '登录',
  },
  SignIn: {
    title: '登录方式',
    thirdParty: '第三方登录',
    signInWithIDass: 'IDass 登录',
    notRegistered: '您还未在平台注册，请联系管理员',
    welcome: '欢迎',
  },
  NotFound: {
    subTitle: '访问的页面不存在',
    buttonText: '返回首页',
  },
  FilterFormWrapper: {
    confirmText: '查询',
    resetText: '重置',
  },
  FormModal: {
    confirmText: '确认',
    cancelText: '取消',
  },
  GameSelect: {
    label: '当前游戏',
    placeholder: '请选择游戏',
  },
  RequireGame: {
    description: '请选择游戏',
  },
  UserWidget: {
    signOutText: '登出',
  },
  UserList: {
    createTitle: '创建用户',
    createSuccessfully: '用户创建成功',
    updateTitle: '更新用户',
    updateSuccessfully: '用户更新成功',
    deleteTitle: '删除用户',
    deleteContent: '确定要删除用户 <%= user %> 吗？',
    deleteSuccessfully: '用户删除成功',
  },
  RoleList: {
    createTitle: '创建角色',
    createSuccessfully: '角色创建成功',
    updateTitle: '更新角色',
    updateSuccessfully: '角色更新成功',
    deleteTitle: '删除角色',
    deleteContent: '确定要删除角色 <%= role %> 吗？',
    deleteSuccessfully: '角色删除成功',
  },
  PermissionList: {
    failedDescription: '获取权限列表失败',
    baseSectionTitle: '平台基础权限',
    gameSectionTitle: '游戏权限',
    gameSectionDescription: '请先选择游戏',
    gameSelectPlaceholder: '请先选择游戏',
    removeText: '移除',
    addText: '添加游戏权限',
  },
  RoleDetail: {
    title: '角色详情',
  },
  InfiniteList: {
    loadingText: '加载中',
    reachEndText: '已经到底了',
    loadMoreText: '加载更多',
  },
}

export default locale
