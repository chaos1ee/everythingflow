import { ProjectSelect } from '@/components'
import type { HistoricalMsgListItem, MessageOrderKey, MessageType } from '@/features/list'
import { useRemoveHistoricalMsgListItem } from '@/features/list'
import { PURE_NUMBER } from '@/rules'
import type { ListResponse } from '@/types'
import { QuestionCircleOutlined } from '@ant-design/icons'
import type { TablePaginationConfig } from 'antd'
import {
  App,
  Card,
  Col,
  DatePicker,
  Form,
  Input,
  InputNumber,
  Radio,
  Row,
  Select,
  Space,
  Tooltip,
  Typography,
} from 'antd'
import type { ColumnsType } from 'antd/es/table'
import type { FilterValue, SorterResult } from 'antd/es/table/interface'
import type { Dayjs } from 'dayjs'
import { useRef } from 'react'
import { useTranslation } from 'react-i18next'
import type { QueryListRef } from 'react-toolkits'
import { PermissionButton, QueryList, useQueryListStore } from 'react-toolkits'

const { Option } = Select
const { RangePicker } = DatePicker
const { Link } = Typography

const action = '/adminApi/msgSearch'

const notice = `本模块支持对消息历史消息进行精确和范围两种方式的搜索。
  精确查询：通过消息唯一MessageID进行精准查询。
  范围查询：先选择需要查询的消息类型。
  - 私聊：暂支持输入发送方
  - 群组聊天：支持同时输入发送方、接收方，接收方（即GroupID）必填
  - 房间聊天：支持同时输入发送方、接收方，接收方（即RoomID）必填
  注：不同项目消息保留的最长天数不同，请关注项目的 ChatConf.history_retain_day 配置。
`

interface FormValues {
  order_by?: MessageOrderKey
  sort_way?: 'asc' | 'desc'
  project_id: number
  type: 1 | 2
  message_id?: string
  message_type?: MessageType
  from?: number
  to?: number
  range?: [Dayjs, Dayjs]
}

const HistoricalMsgList = () => {
  const { t } = useTranslation()
  const { modal } = App.useApp()
  const { trigger } = useRemoveHistoricalMsgListItem()
  const { setPayload } = useQueryListStore()
  const ref = useRef<QueryListRef<FormValues>>(null)
  const projectId = Form.useWatch('project_id', ref.current?.form)

  const columns: ColumnsType<HistoricalMsgListItem> = [
    {
      key: 'message_id',
      title: t('message_id'),
      dataIndex: 'message_id',
      sorter: true,
    },
    {
      key: 'from_uid',
      title: t('sender_id'),
      dataIndex: 'from_uid',
      sorter: true,
    },
    {
      key: 'message_type',
      title: t('message_type'),
      dataIndex: 'message_type',
      render(value: MessageType) {
        if (+value === 1) {
          return t('p2p_chat')
        } else if (+value === 2) {
          return t('group_chat')
        } else {
          return t('room_chat')
        }
      },
    },
    {
      key: 'to_uid',
      title: t('receiver_id'),
      dataIndex: 'to_uid',
      sorter: true,
    },
    {
      key: 'message',
      title: t('message'),
      dataIndex: 'message',
    },
    {
      key: 'modified_time',
      title: t('updated_time'),
      dataIndex: 'modified_time',
      width: 200,
      sorter: true,
    },
    {
      key: 'action',
      title: t('action'),
      width: 80,
      align: 'center',
      render(_, record) {
        return (
          <PermissionButton
            code="7002"
            size="small"
            type="link"
            onClick={() => {
              modal.confirm({
                title: t('delete_message_title'),
                content: t('delete_message_msg', { id: record.message_id }),
                async onOk() {
                  await trigger({
                    project_id: projectId,
                    message_id: record.message_id,
                  })
                },
              })
            }}
          >
            {t('delete')}
          </PermissionButton>
        )
      },
    },
  ]

  const onTableChange = (
    _pagination: TablePaginationConfig,
    _filters: Record<string, FilterValue | null>,
    sorter: SorterResult<HistoricalMsgListItem> | SorterResult<HistoricalMsgListItem>[],
  ) => {
    const field = (sorter as SorterResult<HistoricalMsgListItem>).field
    const order = (sorter as SorterResult<HistoricalMsgListItem>).order

    setPayload(action, {
      arg: {
        order_by: order && (field as MessageOrderKey),
        sort_way: order && (order === 'ascend' ? 'asc' : 'desc'),
      },
    })
  }

  return (
    <Card
      title={
        <Space>
          {t('historical_msg')}
          <Tooltip title={<div className="whitespace-pre-wrap">{notice}</div>}>
            <Link>
              <QuestionCircleOutlined />
            </Link>
          </Tooltip>
        </Space>
      }
    >
      <QueryList<HistoricalMsgListItem, FormValues, ListResponse<HistoricalMsgListItem>>
        ref={ref}
        code="7001"
        rowKey="id"
        columns={columns}
        action={action}
        transformArg={(page, size, values) => {
          const { type, project_id, message_id, order_by, sort_way, range, ...rest } = values as FormValues & {
            order_by?: string
            sort_way?: 'asc' | 'desc'
          }

          if (type === 1) {
            return { project_id, message_id, order_by, sort_way }
          } else {
            return {
              project_id,
              start_time: range?.[0]?.unix(),
              end_time: range?.[1]?.unix(),
              page,
              page_size: size,
              order_by,
              sort_way,
              ...rest,
            }
          }
        }}
        transformResponse={response => ({
          list: response.List,
          total: response.Total,
        })}
        renderForm={form => (
          <Form form={form} initialValues={{ type: 1 }}>
            <Row gutter={10}>
              <Form.Item hidden name="order_by">
                <Input />
              </Form.Item>
              <Form.Item hidden name="sort_way">
                <Input />
              </Form.Item>
              <Col span={4}>
                <Form.Item label={t('project')} rules={[{ required: true }]} name="project_id">
                  <ProjectSelect />
                </Form.Item>
              </Col>
              <Col>
                <Form.Item label={t('search_type')} name="type">
                  <Radio.Group>
                    <Radio.Button value={1}>{t('precise_query')}</Radio.Button>
                    <Radio.Button value={2}>{t('range_query')}</Radio.Button>
                  </Radio.Group>
                </Form.Item>
              </Col>
              <Form.Item noStyle shouldUpdate={(preValues, curValues) => preValues.type !== curValues.type}>
                {() => {
                  if (form.getFieldValue('type') === 1) {
                    return (
                      <Col>
                        <Form.Item label={t('message_id')} name="message_id" rules={[PURE_NUMBER]}>
                          <Input style={{ width: '150px' }} />
                        </Form.Item>
                      </Col>
                    )
                  }

                  return (
                    <>
                      <Col span={4}>
                        <Form.Item label={t('message_type')} name="message_type">
                          <Select allowClear>
                            <Option value="1">{t('p2p_chat')}</Option>
                            <Option value="2">{t('group_chat')}</Option>
                            <Option value="3">{t('room_chat')}</Option>
                          </Select>
                        </Form.Item>
                      </Col>
                      <Col span={4}>
                        <Form.Item label={t('sender_id')} name="from" rules={[{ type: 'integer' }]}>
                          <InputNumber controls={false} className="w-full" />
                        </Form.Item>
                      </Col>
                      <Col span={4}>
                        <Form.Item label={t('receiver_id')} name="to" rules={[{ type: 'integer' }]}>
                          <InputNumber controls={false} className="w-full" />
                        </Form.Item>
                      </Col>
                      <Col>
                        <Form.Item label={t('time_range')} name="range">
                          <RangePicker allowClear showTime allowEmpty={[true, true]} />
                        </Form.Item>
                      </Col>
                    </>
                  )
                }}
              </Form.Item>
            </Row>
          </Form>
        )}
        onTableChange={onTableChange}
      />
    </Card>
  )
}

export default HistoricalMsgList
