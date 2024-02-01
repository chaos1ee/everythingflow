import { ConsoleSqlOutlined, OrderedListOutlined, SafetyOutlined, TableOutlined } from '@ant-design/icons'
import type { NavMenuItem } from 'react-toolkits'

const menuItems: NavMenuItem[] = [
  {
    key: 'list',
    label: 'List',
    icon: <OrderedListOutlined />,
    children: [
      {
        key: 'pagination_list',
        label: 'Pagination List',
        route: '/list/pagination',
      },
      {
        key: 'infinite_list',
        label: 'Infinite List',
        route: '/list/infinite',
      },
    ],
  },
  {
    key: 'handsontable',
    label: 'Handsontable',
    icon: <TableOutlined />,
    children: [
      {
        key: 'diff_table',
        label: 'DiffTable',
        route: '/handsontable/diff',
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
