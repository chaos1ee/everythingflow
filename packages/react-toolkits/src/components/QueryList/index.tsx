/* eslint-disable @typescript-eslint/no-explicit-any */
import type { FormInstance } from 'antd'
import { Form, Result, Spin, Table } from 'antd'
import type { TableProps } from 'antd/es/table'
import qs from 'query-string'
import type { ReactElement, ReactNode, Ref } from 'react'
import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react'
import useSWR, { useSWRConfig } from 'swr'
import { useTranslation } from '../../hooks/i18n'
import { usePermission } from '../../hooks/permission'
import { useQueryListStore } from '../../stores/queryList'
import type { ListResponse } from '../../types'
import type { RequestOptions } from '../../utils/request'
import { request } from '../../utils/request'
import FilterFormWrapper from '../FilterFormWrapper'

export enum QueryListAction {
  Confirm = 'confirm',
  Reset = 'reset',
  Jump = 'jump',
  Init = 'init',
}

export interface QueryListRef<Values = any, Response = any> {
  form: FormInstance<Values>
  response: Response | undefined
}

const fallbackData = {
  list: [],
  total: 0,
}

export interface QueryListProps<Item = any, Values = any, Response = any>
  extends Pick<TableProps<Item>, 'columns' | 'rowKey' | 'tableLayout' | 'expandable' | 'rowSelection' | 'bordered'> {
  action: string
  renderForm?: (form: FormInstance<Values>) => ReactNode
  code?: string
  isGlobalNS?: boolean
  // 把表单的值和分页数据转换成请求参数
  transformArg?: (page: number, size: number, arg: any) => unknown
  // 当请求的返回值不满足时进行转换
  transformResponse?: (response: Response) => ListResponse<Item>
  afterSuccess?: (response: ListResponse<Item>, action?: QueryListAction) => void
  confirmText?: ReactNode
  onePage?: boolean // 无分页
  extra?: (response: Response | undefined, form: FormInstance<Values>) => ReactNode
  onTableChange?: TableProps<Item>['onChange']
  method?: string
  requestHeaders?: RequestOptions['headers'] | ((form: FormInstance<Values>) => RequestOptions['headers'])
  requestBody?: RequestOptions['body'] | ((form: FormInstance<Values>) => RequestOptions['body'])
}

const InternalQueryList = <
  Item extends object,
  Values extends object | undefined,
  Response extends ListResponse<Item> = ListResponse<Item>,
>(
  props: QueryListProps<Item, Values, Response>,
  ref: Ref<QueryListRef<Values, Response>>,
) => {
  const {
    action,
    code,
    confirmText,
    requestHeaders,
    isGlobalNS,
    onePage,
    method = 'GET',
    requestBody,
    extra,
    renderForm,
    transformArg,
    transformResponse,
    afterSuccess,
    onTableChange,
    ...tableProps
  } = props
  const t = useTranslation()
  const [form] = Form.useForm<Values>()
  const { accessible, isLoading } = usePermission(code, isGlobalNS)
  const listAction = useRef<QueryListAction>()
  const { mutate, payloadMap, setPayload, keyMap } = useQueryListStore()
  const { page = 1, size = 10, arg = {} } = payloadMap.get(action) ?? {}
  const [isValid, setIsValid] = useState(false)
  const [response, setResponse] = useState<Response>()
  const { refreshInterval } = useSWRConfig()

  const createBoundAction = <T extends any[], R>(actionFn: (action: string, ...args: T) => R): ((...args: T) => R) => {
    return (...args: T) => actionFn(action, ...args)
  }

  const _setPayload = createBoundAction(setPayload)
  const _mutate = createBoundAction(mutate)

  const parsed = qs.parseUrl(action)

  const params =
    transformArg?.(page, size, arg) ??
    (onePage
      ? arg
      : {
          ...arg,
          page,
          size,
        })

  const queryParams = Object.assign({}, parsed.query, params)
  const queryString = qs.stringify(queryParams)
  const swrKey = isValid ? (queryString ? `${parsed.url}?${queryString}` : parsed.url) : null

  console.log('swrKey', swrKey)

  const headers = typeof requestHeaders === 'function' ? requestHeaders(form) : requestHeaders
  const body = typeof requestBody === 'function' ? requestBody(form) : requestBody

  const {
    data,
    isLoading: isDataLoading,
    isValidating: isDataValidating,
  } = useSWR(
    swrKey,
    async key => {
      const _response = await request<Response>(key, {
        method,
        headers,
        body,
        isGlobalNS,
      })
      setResponse(_response.data)
      const list = transformResponse?.(_response.data) ?? _response.data
      afterSuccess?.(list, listAction.current)
      listAction.current = undefined
      return list
    },
    {
      shouldRetryOnError: false,
      fallbackData,
    },
  )

  const refetch = async () => {
    if (accessible) {
      try {
        await form.validateFields()
        setIsValid(true)
      } catch (err) {
        _mutate(undefined, { revalidate: false })
        setIsValid(false)
        throw err
      } finally {
        _setPayload({
          page: 1,
          arg: form.getFieldsValue(),
        })
      }
    }
  }

  const onConfirm = async () => {
    listAction.current = QueryListAction.Confirm
    await refetch()
  }

  const onReset = async () => {
    listAction.current = QueryListAction.Reset
    await refetch()
    form.resetFields()
  }

  useEffect(() => {
    listAction.current = QueryListAction.Init

    refetch().catch(() => {
      form.resetFields()
    })
  }, [accessible])

  useEffect(() => {
    keyMap.set(action, swrKey)
  }, [keyMap, swrKey, action])

  useImperativeHandle(ref, () => ({
    form,
    response,
  }))

  if (isLoading) {
    return (
      <Spin
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: 300,
        }}
      />
    )
  }

  if (!accessible) {
    return <Result status={403} subTitle={t('global.noEntitlement')} />
  }

  return (
    <div>
      {renderForm ? (
        <FilterFormWrapper confirmText={confirmText} onReset={onReset} onConfirm={onConfirm}>
          {renderForm(form)}
        </FilterFormWrapper>
      ) : (
        <Form form={form} />
      )}
      {extra && <div className="mt-2 mb-4">{extra(response, form)}</div>}
      <Table
        {...tableProps}
        dataSource={data?.list}
        loading={refreshInterval === 0 ? isDataValidating : isDataLoading}
        pagination={
          onePage
            ? false
            : {
                showSizeChanger: true,
                showQuickJumper: true,
                current: page,
                pageSize: size,
                total: data?.total,
                onChange: async (currentPage: number, currentSize: number) => {
                  listAction.current = QueryListAction.Jump
                  _setPayload({
                    page: currentPage,
                    size: currentSize,
                  })
                },
              }
        }
        onChange={onTableChange}
      />
    </div>
  )
}

const QueryList = forwardRef(InternalQueryList) as <
  Item extends object,
  Values extends object | undefined,
  Response = ListResponse<Item>,
>(
  props: QueryListProps<Item, Values, Response> & { ref?: Ref<QueryListRef<Values, Response>> },
) => ReactElement

export default QueryList
