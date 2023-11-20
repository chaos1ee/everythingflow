import { ConsoleSqlOutlined, SafetyOutlined } from '@ant-design/icons'
import type { NavMenuItem } from 'react-toolkits'

const navItems: NavMenuItem[] = [
  {
    key: 'table',
    label: '表',
    icon: <ConsoleSqlOutlined />,
    children: [
      {
        key: 'table_list',
        label: '查询表',
        route: '/console/table',
      },
      {
        key: 'version_list',
        label: '版本',
        route: '/console/table/version',
      },
    ],
  },
  {
    key: 'operation_log',
    label: '操作日志',
    icon: <ConsoleSqlOutlined />,
    route: '/log/operation_log',
  },
  {
    key: 'permission',
    label: '权限管理',
    icon: <SafetyOutlined />,
    children: [
      {
        key: 'user_list',
        label: '用户',
        route: '/permission/user',
      },
      {
        key: 'role_list',
        label: '角色',
        route: '/permission/role',
      },
    ],
  },
]

export default navItems
