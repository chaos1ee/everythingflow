import { lazy } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'

const UserList = lazy(() => import('./UserList'))
const RoleList = lazy(() => import('./RoleList'))
const RoleDetail = lazy(() => import('./RoleDetail'))

const Permission = () => {
  return (
    <Routes>
      <Route index element={<Navigate to="user" />} />
      <Route path="user" element={<UserList />} />
      <Route path="role" element={<RoleList />} />
      <Route path="role/:name" element={<RoleDetail />} />
    </Routes>
  )
}

export default Permission
