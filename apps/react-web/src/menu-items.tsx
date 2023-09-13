import { ConsoleSqlOutlined, SafetyOutlined } from '@ant-design/icons'
import type { ItemType2 } from 'react-toolkits'

const navItems: ItemType2[] = [
  {
    key: 'table',
    label: '表',
    icon: <ConsoleSqlOutlined />,
    children: [
      {
        key: 'table_list',
        label: '查询表',
        route: '/table',
      },
      {
        key: 'version_list',
        label: '版本',
        route: '/table/version',
      },
    ],
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
