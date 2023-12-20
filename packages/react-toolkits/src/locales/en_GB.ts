import type { Locale } from '../types'

const locale: Locale = {
  global: {
    noEntitlement: 'No permission, please contact the administrator.',
    name: 'Name',
    creationTime: 'Creation Time',
    operation: 'Operation',
    update: 'Update',
    edit: 'Edit',
    delete: 'Delete',
    selectAll: 'Select All',
    game: 'Game',
    user: 'User',
    role: 'Role',
    username: 'Username',
    password: 'Password',
    label: 'Label',
    method: 'Method',
    route: 'Route',
    request: 'Request',
    response: 'Response',
    add: 'Add',
    signIn: 'Sign In',
  },
  SignIn: {
    title: 'Sign In Method',
    thirdParty: 'Third party sign in',
    signInWithIDass: 'Sign in width IDass',
    notRegistered: 'You are not yet registered on the platform, please contact the administrator',
    welcome: 'Welcome',
  },
  NotFound: {
    subTitle: 'The page you visited does not exist',
    buttonText: 'Return to homepage',
  },
  FilterFormWrapper: {
    confirmText: 'Search',
    resetText: 'Reset',
  },
  FormModal: {
    confirmText: 'Confirm',
    cancelText: 'Cancel',
  },
  GameSelect: {
    label: 'Current Game',
    placeholder: 'Please select a game',
  },
  RequireGame: {
    description: 'Please select a game',
  },
  UserWidget: {
    signOutText: 'Sign Out',
  },
  UserList: {
    createTitle: 'Create User',
    createSuccessfully: 'User created successfully',
    updateTitle: 'Update User',
    updateSuccessfully: 'User updated successfully',
    deleteTitle: 'Delete User',
    deleteContent: 'Are you sure you want to delete user <%= user %>?',
    deleteSuccessfully: 'User deleted successfully',
  },
  RoleList: {
    createTitle: 'Create Role',
    createSuccessfully: 'Role created successfully',
    updateTitle: 'Update Role',
    updateSuccessfully: 'Role updated successfully',
    deleteTitle: 'Delete Role',
    deleteContent: 'Are you sure you want to delete role <%= role %>?',
    deleteSuccessfully: 'Role deleted successfully',
  },
  PermissionList: {
    failedDescription: 'Failed to get permission list',
    baseSectionTitle: 'Platform Basic Permissions',
    gameSectionTitle: 'Game Permissions',
    gameSectionDescription: 'Please select a game first',
    gameSelectPlaceholder: 'Please select a game first',
    removeText: 'Remove',
    addText: 'Add Game Permissions',
  },
  RoleDetail: {
    title: 'Role Details',
  },
  InfiniteList: {
    loadingText: 'Loading...',
    reachEndText: "You've reached the end",
    loadMoreText: 'Load more',
  },
}

export default locale
