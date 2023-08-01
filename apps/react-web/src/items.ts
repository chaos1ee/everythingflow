import type { ItemType2 } from 'react-toolkits'

const navItems: ItemType2[] = [
  {
    key: 'instance',
    label: '实例管理',
    icon: 'DatabaseOutlined',
    children: [
      {
        key: 'instance_tree',
        label: '实例',
        route: '/instance',
      },
    ],
  },
  {
    key: 'sql',
    label: 'SQL',
    icon: 'ConsoleSqlOutlined',
    children: [
      {
        key: 'query_online',
        label: '在线查询',
        route: '/sql/query_online',
      },
    ],
  },
  {
    key: 'permission',
    label: '权限管理',
    icon: 'SafetyOutlined',
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
