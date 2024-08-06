import type { ContextState } from './context'

export const defaultState: ContextState = {
  appTitle: '',
  menuItems: [],
  hideGameSelect: false,
  usePermissionApiV2: false,
  signInUrl: '',
  signInSuccessRedirectUrl: '/',
}
