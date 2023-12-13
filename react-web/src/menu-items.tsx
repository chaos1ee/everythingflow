import { ConsoleSqlOutlined, SafetyOutlined, TableOutlined } from '@ant-design/icons'
import type { NavMenuItem } from 'react-toolkits'

const menuItems: NavMenuItem[] = [
  {
    key: 'list',
    label: 'List',
    icon: <TableOutlined />,
    children: [
      {
        key: 'normal_list',
        label: 'List',
        route: '/list',
      },
      {
        key: 'infinite_list',
        label: 'InfiniteList',
        route: '/list/infinite',
      },
    ],
  },
  {
    key: 'operation_log',
    label: '操作日志',
    icon: <ConsoleSqlOutlined />,
    route: '/operation_log',
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

export default menuItems
