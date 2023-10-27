import type { TableCellLog, TableData, VersionListItem, VersionRecordListItem } from '@/features/common'
import { datetime, delay, listRequest2, plainRequest, randomArray } from '@/utils/mock'
import {
  rand,
  randBoolean,
  randFullName,
  randNumber,
  randSemver,
  randSentence,
  randUuid,
  randWord,
} from '@ngneat/falso'
import { rest, RESTMethods } from 'msw'

const handlers = [
  listRequest2<VersionListItem>('/api/version/list', () => ({
    id: randUuid(),
    name: randWord(),
    comment: randSentence(),
    ctime: datetime(),
    auth: randFullName(),
  })),
  listRequest2<VersionRecordListItem>('/api/version/operate', () => ({
    id: randNumber(),
    version_id: randNumber(),
    auth: randFullName(),
    type: randNumber(),
    comment: randSentence(),
    ctime: datetime(),
    type_name: rand(['更新', '创建']),
  })),
  plainRequest<TableData>('/api/table/data', {
    data: [
      [
        'winter_disaster_plot_task_group_v_5.2_1',
        'winter_disaster_group_v_5.2',
        '1',
        'solar_unify_lake_tear_subtitle',
        'equipment',
        'item_noble_signet',
        '10',
        'item_building_speedup_60m',
        '5',
        'item_training_speedup_60m',
        '5',
        'item_winter_disaster_magic_stone',
      ],
      [
        'winter_disaster_plot_task_group_v_5.2_1',
        'winter_disaster_group_v_5.2',
        '1',
        'solar_unify_lake_tear_subtitle',
        'equipment',
        'item_noble_signet',
        '10',
        'item_building_speedup_60m',
        '5',
        'item_training_speedup_60m',
        '5',
        'item_winter_disaster_magic_stone',
      ],
      [
        'winter_disaster_plot_task_group_v_5.2_1',
        'winter_disaster_group_v_5.2',
        '1',
        'solar_unify_lake_tear_subtitle',
        'equipment',
        'item_noble_signet',
        '10',
        'item_building_speedup_60m',
        '5',
        'item_training_speedup_60m',
        '5',
        'item_winter_disaster_magic_stone',
      ],
      [
        'winter_disaster_plot_task_group_v_5.2_1',
        'winter_disaster_group_v_5.2',
        '1',
        'solar_unify_lake_tear_subtitle',
        'equipment',
        'item_noble_signet',
        '10',
        'item_building_speedup_60m',
        '5',
        'item_training_speedup_60m',
        '5',
        'item_winter_disaster_magic_stone',
      ],
      [
        'winter_disaster_plot_task_group_v_5.2_1',
        'winter_disaster_group_v_5.2',
        '1',
        'solar_unify_lake_tear_subtitle',
        'equipment',
        'item_noble_signet',
        '10',
        'item_building_speedup_60m',
        '5',
        'item_training_speedup_60m',
        '5',
        'item_winter_disaster_magic_stone',
      ],
      [
        'winter_disaster_plot_task_group_v_5.2_1',
        'winter_disaster_group_v_5.2',
        '1',
        'solar_unify_lake_tear_subtitle',
        'equipment',
        'item_noble_signet',
        '10',
        'item_building_speedup_60m',
        '5',
        'item_training_speedup_60m',
        '5',
        'item_winter_disaster_magic_stone',
      ],
      [
        'winter_disaster_plot_task_group_v_5.2_1',
        'winter_disaster_group_v_5.2',
        '1',
        'solar_unify_lake_tear_subtitle',
        'equipment',
        'item_noble_signet',
        '10',
        'item_building_speedup_60m',
        '5',
        'item_training_speedup_60m',
        '5',
        'item_winter_disaster_magic_stone',
      ],
    ],
    title: [
      [
        'id',
        'winter_disaster_group_id@winter_disaster_group.id',
        'stage',
        'name^c',
        'icon^c',
        'reward_id_1@itemlist.id',
        'reward_value_1',
        'reward_id_2@itemlist.id',
        'reward_value_2',
        'reward_id_3@itemlist.id',
        'reward_value_3',
        'slot_need_item@itemlist.id',
      ],
      ['string', 'ref', 'long', 'string', 'string', 'ref', 'long', 'ref', 'long', 'ref', 'long', 'ref'],
      [
        'id',
        '组id',
        '阶段',
        '名称',
        '图标',
        '奖励道具id_1',
        '奖励道具数量_1',
        '奖励道具id_2',
        '奖励道具数量_2',
        '奖励道具id_3',
        '奖励道具数量_3',
        '槽位解锁需要道具1111111',
      ],
    ],
  }),
  plainRequest<boolean>('/api/table/check_lock', false, RESTMethods.POST),
  rest.post('/api/table/lock', (req, res, ctx) => {
    const success = randBoolean()

    if (success) {
      return res(
        ctx.status(200),
        ctx.json({
          code: 0,
          msg: 'ok',
        }),
        ctx.delay(1500),
      )
    }

    return res(
      ctx.status(200),
      ctx.json({
        code: 1,
        msg: '请求锁失败',
      }),
      ctx.delay(1500),
    )
  }),
  plainRequest<{ list: TableCellLog[] }>(
    '/api/data/log',
    () => ({
      list: randomArray({ min: 2, max: 5 }).map(() => ({
        operate_id: randNumber(),
        operate_type: rand([1, 2]),
        data_value: randWord(),
        auth: randFullName(),
        ctime: datetime(),
        type_name: rand(['添加', '创建']),
        diff: randWord(),
      })),
    }),
    RESTMethods.GET,
    delay(1000),
  ),
  plainRequest<{
    list: {
      id: number
      name: string
      last_version?: number
    }[]
  }>(
    '/api/enum/version',
    () => ({
      list: randomArray({ min: 2, max: 5 }).map(() => ({
        id: randNumber(),
        name: randSemver(),
        last_version: randNumber(),
      })),
    }),
    RESTMethods.GET,
    delay(1000),
  ),
]

export default handlers
