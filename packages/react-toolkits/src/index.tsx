import { lazy } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import type { ContextState } from './components/ContextProvider'
import ContextProvider, { contextStore, useToolkitsContext } from './components/ContextProvider'
import type { DynamicTagsProps } from './components/DynamicTags'
import DynamicTags from './components/DynamicTags'
import type { FilterFormWrapperProps } from './components/FilterFormWrapper'
import FilterFormWrapper from './components/FilterFormWrapper'
import type { Game, GameState } from './components/GameSelect'
import GameSelect, { useGameStore } from './components/GameSelect'
import type { HighlightTextsProps } from './components/Highlight'
import Highlight from './components/Highlight'
import type { InfiniteListProps } from './components/InfiniteList'
import InfiniteList from './components/InfiniteList'
import Layout from './components/Layout'
import type { NavMenuItem } from './components/NavMenu'
import NavMenu from './components/NavMenu'
import type { PermissionButtonProps } from './components/PermissionButton'
import PermissionButton from './components/PermissionButton'
import type { PermissionGuardProps } from './components/PermissionGuard'
import PermissionGuard from './components/PermissionGuard'
import type { QueryListProps, QueryListRef } from './components/QueryList'
import QueryList, { QueryListAction } from './components/QueryList'
import { useQueryListStore } from './components/QueryList/store'
import UserWidget from './components/UserWidget'
import type { UseFormModalProps } from './hooks/formModal'
import { useFormModal } from './hooks/formModal'
import { useTranslation } from './hooks/i18n'
import { useModal, useModalStore } from './hooks/modal'
import { usePermission, usePermissions } from './hooks/permission'
import type { TokenState } from './stores/token'
import { useTokenStore, useTokenValidation } from './stores/token'
import './styles/index.css'
import type { RequestOptions, RequestResponse } from './utils/request'
import { RequestError, request } from './utils/request'
import { withLayout } from './utils/router'
import { mixedStorage } from './utils/storage'

const SignIn = lazy(() => import('./pages/SignIn'))
const NotFound = lazy(() => import('./pages/NotFound'))
const OperationLogList = lazy(() => import('./pages/OperationLogList'))
const UserList = lazy(() => import('./pages/permission/UserList'))
const RoleList = lazy(() => import('./pages/permission/RoleList'))
const RoleDetail = lazy(() => import('./pages/permission/RoleDetail'))

const PermissionRoutes = () => {
  return (
    <Routes>
      <Route index element={<Navigate to="user" />} />
      <Route path="user" element={<UserList />} />
      <Route path="role" element={<RoleList />} />
      <Route path="role/:name" element={<RoleDetail />} />
    </Routes>
  )
}

export {
  ContextProvider,
  DynamicTags,
  FilterFormWrapper,
  GameSelect,
  Highlight,
  InfiniteList,
  Layout,
  NavMenu,
  NotFound,
  OperationLogList,
  PermissionButton,
  PermissionGuard,
  PermissionRoutes,
  QueryList,
  QueryListAction,
  RequestError,
  SignIn,
  UserWidget,
  contextStore,
  mixedStorage,
  request,
  useFormModal,
  useGameStore,
  useModal,
  useModalStore,
  usePermission,
  usePermissions,
  useQueryListStore,
  useTokenStore,
  useTokenValidation,
  useToolkitsContext,
  useTranslation,
  withLayout,
  type ContextState,
  type DynamicTagsProps,
  type FilterFormWrapperProps,
  type Game,
  type GameState,
  type HighlightTextsProps,
  type InfiniteListProps,
  type NavMenuItem,
  type PermissionButtonProps,
  type PermissionGuardProps,
  type QueryListProps,
  type QueryListRef,
  type RequestOptions,
  type RequestResponse,
  type TokenState,
  type UseFormModalProps,
}
