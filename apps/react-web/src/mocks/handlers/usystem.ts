import { rand, randFullName, randNumber, randText, randWord } from '@ngneat/falso'
import * as jose from 'jose'
import { RESTMethods } from 'msw'
import { SECRET } from '~/constants'
import { mock } from '~/utils'

const { plainRequest, listRequest, randomArray, delay, datetime } = mock

const handlers = [
  plainRequest('/api/usystem/user/login', async () => {
    const token = await new jose.SignJWT({
      authorityId: 'hao.li',
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime('12h')
      .sign(SECRET)

    return { token }
  }),
  plainRequest(
    '/api/usystem/user/check',
    {
      has_all: true,
    },
    RESTMethods.POST,
    delay(1000),
  ),
  plainRequest(
    '/api/usystem/user/checkV2',
    {
      has_all: true,
    },
    RESTMethods.POST,
    delay(1000),
  ),
  plainRequest(
    '/api/usystem/game/all',
    randomArray({ min: 1, max: 5 }).map(() => ({
      id: randNumber(),
      name: randWord(),
      area: rand(['cn', 'global']),
      Ctime: datetime(),
    })),
    RESTMethods.GET,
    delay(3000),
  ),
  plainRequest(
    '/api/usystem/role/all',
    randomArray({ min: 1, max: 10 }).map(() => ({
      id: randNumber(),
      name: randFullName(),
    })),
  ),
  listRequest('/api/usystem/user/list', () => ({
    id: randNumber(),
    name: randFullName(),
    ctime: mock.datetime(),
    roles: mock.randomArray({ min: 0, max: 4 }).map(() => randText()),
  })),
  listRequest('/api/usystem/role/list', () => ({
    id: randNumber(),
    name: randFullName(),
    ctime: mock.datetime(),
  })),
  plainRequest('/api/usystem/user/allPermssions', [
    {
      category: '用户管理',
      permissions: [
        {
          label: '用户列表',
          value: '100001',
          route: '/api/usystem/user/list',
          method: '',
        },
        {
          label: '添加用户',
          value: '100002',
          route: '/api/usystem/user/create',
          method: '',
        },
        {
          label: '修改用户',
          value: '100003',
          route: '/api/usystem/user/update',
          method: '',
        },
        {
          label: '删除用户',
          value: '100004',
          route: '/api/usystem/user/delete',
          method: '',
        },
      ],
    },
    {
      category: '角色管理',
      permissions: [
        {
          label: '角色列表',
          value: '200001',
          route: '/api/usystem/role/list',
          method: '',
        },
        {
          label: '添加角色',
          value: '200002',
          route: '/api/usystem/role/create',
          method: '',
        },
        {
          label: '修改角色',
          value: '200003',
          route: '/api/usystem/role/update',
          method: '',
        },
        {
          label: '删除角色',
          value: '200004',
          route: '/api/usystem/role/delete',
          method: '',
        },
        {
          label: '角色详情',
          value: '200005',
          route: '/api/usystem/role/info',
          method: '',
        },
        {
          label: '所有角色',
          value: '200006',
          route: '/api/usystem/role/all',
          method: '',
        },
      ],
    },
    {
      category: '项目Project',
      permissions: [
        {
          label: '项目列表',
          value: '3001',
          route: '/adminApi/project',
          method: '',
        },
        {
          label: '项目详细信息',
          value: '3002',
          route: '/adminApi/project/detail',
          method: '',
        },
        {
          label: '编辑项目',
          value: '3003',
          route: '/adminApi/project/edit',
          method: '',
        },
        {
          label: '项目清档',
          value: '3004',
          route: '/adminApi/project/clear',
          method: '',
        },
        {
          label: '获取项目简单列表',
          value: '3005',
          route: '/adminApi/project/simple',
          method: '',
        },
      ],
    },
  ]),
  plainRequest('/api/usystem/user/allPermissionsV2', {
    game: [
      {
        id: 'dino.global.prod',
        name: 'Age of Dino',
        area: 'global',
        Ctime: '2023-08-14 08:08:18',
        Custom1: 0,
        Custom2: 0,
        Custom3: {
          String: '',
          Valid: false,
        },
      },
      {
        id: 'test.cn.prod',
        name: 'crystal',
        area: 'cn',
        Ctime: '2023-06-07 09:10:21',
        Custom1: 0,
        Custom2: 0,
        Custom3: {
          String: '',
          Valid: false,
        },
      },
    ],
    permission: [
      {
        category: '用户管理',
        permissions: [
          {
            label: '用户列表',
            value: '100001',
            route: '/api/usystem/user/list',
            method: '',
          },
          {
            label: '添加用户',
            value: '100002',
            route: '/api/usystem/user/create',
            method: '',
          },
          {
            label: '修改用户',
            value: '100003',
            route: '/api/usystem/user/update',
            method: '',
          },
          {
            label: '删除用户',
            value: '100004',
            route: '/api/usystem/user/delete',
            method: '',
          },
        ],
      },
      {
        category: '角色管理',
        permissions: [
          {
            label: '角色列表',
            value: '200001',
            route: '/api/usystem/role/list',
            method: '',
          },
          {
            label: '添加角色',
            value: '200002',
            route: '/api/usystem/role/createV2',
            method: '',
          },
          {
            label: '修改角色',
            value: '200003',
            route: '/api/usystem/role/updateV2',
            method: '',
          },
          {
            label: '删除角色',
            value: '200004',
            route: '/api/usystem/role/delete',
            method: '',
          },
          {
            label: '角色详情',
            value: '200005',
            route: '/api/usystem/role/infoV2',
            method: '',
          },
          {
            label: '所有角色',
            value: '200006',
            route: '/api/usystem/role/all',
            method: '',
          },
        ],
      },
      {
        category: 'Push管理平台',
        permissions: [
          {
            label: '获取配置',
            value: '300001',
            route: '/api/config/get',
            method: '',
          },
          {
            label: '配置修改',
            value: '300002',
            route: '/api/config/push',
            method: '',
          },
          {
            label: '配置删除',
            value: '300003',
            route: '/api/config/del',
            method: '',
          },
          {
            label: '消息推送',
            value: '300004',
            route: '/api/push/send',
            method: '',
          },
        ],
      },
      {
        category: '实名认证&防沉迷',
        permissions: [
          {
            label: '实名认证配置获取',
            value: '400001',
            route: '/api/idauth/get_auth_basic_config',
            method: '',
          },
          {
            label: '实名认证配置修改',
            value: '400002',
            route: '/api/idauth/update_auth_basic_config',
            method: '',
          },
          {
            label: '白名单列表',
            value: '400003',
            route: '/api/idauth/get_white_list',
            method: '',
          },
          {
            label: '白名单添加',
            value: '400004',
            route: '/api/idauth/update_white_list',
            method: '',
          },
          {
            label: '白名单删除',
            value: '400005',
            route: '/api/idauth/delete_white_list',
            method: '',
          },
          {
            label: '防沉迷配置获取',
            value: '400006',
            route: '/api/idauth/get_auth_detail_config',
            method: '',
          },
          {
            label: '防沉迷配置修改',
            value: '400007',
            route: '/api/idauth/update_auth_detail_config',
            method: '',
          },
          {
            label: '节假日获取',
            value: '400008',
            route: '/api/idauth/get_public_holidays_list',
            method: '',
          },
          {
            label: '节假日修改',
            value: '400009',
            route: '/api/idauth/update_public_holidays',
            method: '',
          },
          {
            label: '文案获取',
            value: '400010',
            route: '/api/idauth/get_json_config',
            method: '',
          },
          {
            label: '文案修改',
            value: '400011',
            route: '/api/idauth/update_json_config',
            method: '',
          },
          {
            label: '实名认证查询',
            value: '400012',
            route: '/api/idauth/get_user_auth_info',
            method: '',
          },
          {
            label: '实名认证删除',
            value: '400013',
            route: '/api/idauth/delete_user_auth_info',
            method: '',
          },
        ],
      },
      {
        category: '用户中心管理平台',
        permissions: [
          {
            label: '登陆方式获取',
            value: '500001',
            route: '/api/innerapi/get_login_info',
            method: '',
          },
          {
            label: '登陆方式修改',
            value: '500002',
            route: '/api/innerapi/update_login_info',
            method: '',
          },
          {
            label: '用户中心获取',
            value: '500003',
            route: '/api/innerapi/get_config_info',
            method: '',
          },
          {
            label: '用户中心修改',
            value: '500004',
            route: '/api/innerapi/update_config_info',
            method: '',
          },
        ],
      },
    ],
  }),
  plainRequest('/api/usystem/role/info', {
    id: randNumber(),
    name: randFullName(),
    ctime: mock.datetime(),
    permissions: ['100001', '100002', '100003', '6001'],
  }),
  plainRequest('/api/usystem/role/infoV2', {
    id: 7,
    name: 'role_李浩的测试角色',
    ctime: '2023-05-16 03:24:12',
    permissions: {
      'foo.cn.prod': [
        '300001',
        '300002',
        '300003',
        '300004',
        '400001',
        '400003',
        '400002',
        '400006',
        '400008',
        '400010',
      ],
    },
  }),
]

export default handlers
