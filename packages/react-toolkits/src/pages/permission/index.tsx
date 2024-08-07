import { lazy } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'

const UserList = lazy(() => import('./userList'))
const RoleList = lazy(() => import('./roleList'))
const RoleDetail = lazy(() => import('./roleDetail'))

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

export default PermissionRoutes
