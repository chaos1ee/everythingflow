import type { Locale } from '../types'

const locale: Locale = {
  global: {
    noEntitlement: '権限がありません、管理者に連絡してください。',
    name: '名前',
    creationTime: '作成時間',
    operation: '操作',
    update: '更新',
    edit: '編集',
    delete: '削除',
    selectAll: '全て選択',
    game: 'ゲーム',
    user: 'ユーザー',
    role: '役割',
    username: 'ユーザー名',
    password: 'パスワード',
    label: 'ラベル',
    method: '方法',
    route: 'ルート',
    request: 'リクエスト',
    response: 'レスポンス',
    add: 'ついか',
    signIn: 'ログイン',
  },
  SignIn: {
    title: 'ログイン方法',
    thirdParty: 'サードパーティログイン',
    signInWithIDass: 'IDass ログイン',
    notRegistered: 'あなたはまだプラットフォームに登録されていません、管理者に連絡してください',
    welcome: 'ウェルカム',
  },
  NotFound: {
    subTitle: 'アクセスしたページは存在しません',
    buttonText: 'ページに戻る',
  },
  FilterFormWrapper: {
    confirmText: '検索',
    resetText: 'リセット',
  },
  FormModal: {
    confirmText: '確認',
    cancelText: 'キャンセル',
  },
  GameSelect: {
    label: '現在のゲーム',
    placeholder: 'ゲームを選択してください',
  },
  RequireGame: {
    description: 'ゲームを選択してください',
  },
  UserWidget: {
    signOutText: 'ログアウト',
  },
  UserList: {
    createTitle: 'ユーザーを作成',
    createSuccessfully: 'ユーザーが正常に作成されました',
    updateTitle: 'ユーザーを更新',
    updateSuccessfully: 'ユーザーが正常に更新されました',
    deleteTitle: 'ユーザーを削除',
    deleteContent: 'ユーザー<%= user %>を削除してもよろしいですか？',
    deleteSuccessfully: 'ユーザーが正常に削除されました',
  },
  RoleList: {
    createTitle: '役割を作成',
    createSuccessfully: '役割が正常に作成されました',
    updateTitle: '役割を更新',
    updateSuccessfully: '役割が正常に更新されました',
    deleteTitle: '役割を削除',
    deleteContent: '役割<%= role %>を削除してもよろしいですか？',
    deleteSuccessfully: '役割が正常に削除されました',
  },
  PermissionList: {
    failedDescription: '権限リストの取得に失敗しました',
    baseSectionTitle: 'プラットフォーム基本権限',
    gameSectionTitle: 'ゲーム権限',
    gameSectionDescription: '先にゲームを選択してください',
    gameSelectPlaceholder: '先にゲームを選択してください',
    removeText: '削除',
    addText: 'ゲーム権限を追加',
  },
  RoleDetail: {
    title: '役割詳細',
  },
  InfiniteList: {
    loadingText: '読み込み中',
    reachEndText: '最後まで到達しました',
    loadMoreText: 'もっと読み込む',
  },
}

export default locale
