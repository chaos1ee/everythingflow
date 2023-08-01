import { Outlet } from 'react-router-dom'
import { usePermission } from 'react-toolkits'

const ConsoleGuard = () => {
  const { isValidating } = usePermission('100001')

  if (isValidating) return null

  return <Outlet />
}

export default ConsoleGuard
