import type { Locale } from '.'

const locale: Locale = {
  global: {
    noEntitlement: '권한이 없습니다, 관리자에게 문의하십시오.',
    name: '이름',
    creationTime: '생성 시간',
    operation: '작업',
    update: '업데이트',
    edit: '편집',
    delete: '삭제',
    selectAll: '모두 선택',
    game: '게임',
    user: '사용자',
    role: '역할',
    username: '사용자 이름',
    password: '비밀번호',
    label: '라벨',
    method: '방법',
    route: '노선',
    request: '요청',
    response: '응답',
    add: '추가',
    signIn: '로그인',
  },
  SignIn: {
    title: '로그인 방법',
    thirdParty: '제3자 로그인',
    signInWithIDass: 'IDass 로그인',
    notRegistered: '플랫폼에 아직 등록되지 않았습니다, 관리자에게 문의하십시오',
    welcome: '웰컴',
  },
  NotFound: {
    subTitle: '방문한 페이지가 존재하지 않습니다',
    buttonText: '페이지로 돌아가기',
  },
  FilterFormWrapper: {
    confirmText: '검색',
    resetText: '리셋',
  },
  FormModal: {
    confirmText: '확인',
    cancelText: '취소',
  },
  GameSelect: {
    label: '현재 게임',
    placeholder: '게임을 선택해주세요',
  },
  RequireGame: {
    description: '게임을 선택해주세요',
  },
  UserWidget: {
    signOutText: '로그아웃',
  },
  UserList: {
    createTitle: '사용자 생성',
    createSuccessfully: '사용자가 성공적으로 생성되었습니다',
    updateTitle: '사용자 업데이트',
    updateSuccessfully: '사용자가 성공적으로 업데이트되었습니다',
    deleteTitle: '사용자 삭제',
    deleteContent: '사용자 <%= user %>를 삭제하시겠습니까?',
    deleteSuccessfully: '사용자가 성공적으로 삭제되었습니다',
  },
  RoleList: {
    createTitle: '역할 생성',
    createSuccessfully: '역할이 성공적으로 생성되었습니다',
    updateTitle: '역할 업데이트',
    updateSuccessfully: '역할이 성공적으로 업데이트되었습니다',
    deleteTitle: '역할 삭제',
    deleteContent: '역할 <%= role %>를 삭제하시겠습니까?',
    deleteSuccessfully: '역할이 성공적으로 삭제되었습니다',
  },
  PermissionList: {
    failedDescription: '권한 목록을 가져오는 데 실패했습니다',
    baseSectionTitle: '플랫폼 기본 권한',
    gameSectionTitle: '게임 권한',
    gameSectionDescription: '먼저 게임을 선택해주세요',
    gameSelectPlaceholder: '먼저 게임을 선택해주세요',
    removeText: '제거',
    addText: '게임 권한 추가',
  },
  RoleDetail: {
    title: '역할 세부 정보',
  },
  InfiniteList: {
    loadingText: '로딩 중',
    reachEndText: '끝에 도달했습니다',
    loadMoreText: '더 로드하기',
  },
}

export default locale
