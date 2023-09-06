import { ConsoleSqlOutlined, SafetyOutlined } from '@ant-design/icons'
import type { ItemType2 } from 'react-toolkits'

const navItems: ItemType2[] = [
  {
    key: 'table',
    label: '表',
    icon: <ConsoleSqlOutlined />,
    route: '/table',
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
        code: '300001',
      },
      {
        key: 'role_list',
        label: '角色',
        route: '/permission/role',
        code: '100001',
      },
    ],
  },
]

export default navItems
