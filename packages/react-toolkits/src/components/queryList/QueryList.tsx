/* eslint-disable @typescript-eslint/no-explicit-any */
import type { FormInstance } from 'antd'
import { Form, Result, Spin, Table } from 'antd'
import type { AnyObject } from 'antd/es/_util/type'
import type { TableProps } from 'antd/es/table'
import type { ReactElement, ReactNode, Ref } from 'react'
import { cloneElement, forwardRef, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react'
import useSWR, { unstable_serialize } from 'swr'
import { usePermission } from '../../hooks/permission'
import type { RequestOptions } from '../../utils/request'
import { request } from '../../utils/request'
import { useToolkitsContext } from '../contextProvider'
import FilterFormWrapper from '../filterFormWrapper'
import { useGameStore } from '../gameSelect'
import { useTranslation } from '../locale'
import { useQueryListStore } from './store'

export interface ListResponse<T = any> {
  list: T[]
  total: number
}

export interface QueryListPayload<FormValues = any> {
  page?: number
  size?: number
  formValue?: FormValues
}

export enum QueryListAction {
  Confirm,
  Reset,
  Jump,
  Init,
}

export interface QueryListDataType<Item> {
  dataSource: Item[]
  total: number
}

export interface QueryListRef<Item, Value, Response> {
  response: Response | undefined
  dataSource: Item[] | undefined
  form: FormInstance<Value>
}

export interface QueryListProps<Item extends AnyObject = AnyObject, Value = any, Response = any>
  extends Omit<TableProps<Item>, 'pagination' | 'dataSource' | 'loading'> {
  code?: string
  isGlobal?: boolean
  url: string
  method?: 'GET' | 'POST'
  refreshInterval?: number
  // 无分页
  onePage?: boolean
  defaultSize?: number
  headers?: RequestOptions['headers']
  buttonsAlign?: 'left' | 'right'
  body?: RequestOptions['body'] | ((payload: QueryListPayload<Value>) => RequestOptions['body'])
  params?: RequestOptions['params'] | ((payload: QueryListPayload<Value>) => RequestOptions['params'])
  tableExtra?: ReactNode | ((form: FormInstance<Value>) => ReactNode)
  renderForm?: (form: FormInstance<Value>) => ReactElement
  extra?: (opts: { form: FormInstance<Value>; data: Response | undefined }) => ReactNode
  afterSuccess?: (action: QueryListAction, response: Response) => void
  getTotal?: (response: Response | undefined) => number | undefined
  getDataSource?: (response: Response | undefined, form: FormInstance<Value>) => Item[] | undefined
}

const InternalQueryList = <
  Item extends AnyObject = AnyObject,
  Value = any,
  // 默认接口返回值类型为 ListResponse<Item>，当符合时无需设置 getTotal、getDataSource 就可以让组件正确获取 total 与 dataSource。
  Response = ListResponse<Item>,
>(
  props: QueryListProps<Item, Value, Response>,
  ref: Ref<QueryListRef<Item, Value, Response>>,
) => {
  const internalProps = {
    method: 'GET',
    defaultSize: 10,
    refreshInterval: 0,
    getTotal: (response: Response | undefined) => (response as ListResponse<Item>)?.total,
    getDataSource: (response: Response | undefined) => (response as ListResponse<Item>)?.list,
    ...props,
  }

  const {
    url,
    code,
    headers,
    isGlobal,
    onePage,
    method,
    buttonsAlign,
    defaultSize,
    refreshInterval,
    tableExtra,
    extra,
    renderForm,
    afterSuccess,
    body,
    params,
    getTotal,
    getDataSource,
    ...tableProps
  } = internalProps

  const { t } = useTranslation()
  const [form] = Form.useForm<Value>()
  const { accessible, isLoading } = usePermission(code, isGlobal)
  const action = useRef<QueryListAction>(QueryListAction.Init)
  const originalData = useRef<Response>()
  const { game } = useGameStore()
  const { usePermissionApiV2 } = useToolkitsContext()
  const [isValid, setIsValid] = useState(false)
  const { keyMap, getPayload, refetch } = useQueryListStore()
  const { page, size = defaultSize, formValue = form.getFieldsValue() } = getPayload(url)
  const payload = { page, size, formValue }

  const _body = useMemo(() => {
    return typeof body === 'function'
      ? body(payload)
      : method === 'POST'
        ? {
            ...formValue,
            ...(!onePage ? { page, size } : null),
            ...body,
          }
        : null
  }, [onePage, method, page, size, formValue, body])

  const _params = useMemo(
    () =>
      typeof params === 'function'
        ? params(payload)
        : method === 'GET'
          ? {
              ...formValue,
              ...(!onePage ? { page, size } : null),
              ...params,
            }
          : null,
    [onePage, method, page, size, formValue, params],
  )

  const _headers = useMemo(() => {
    const newHeaders = new Headers(headers)

    if (usePermissionApiV2) {
      if (isGlobal) {
        newHeaders.set('App-ID', 'global')
      } else if (game) {
        newHeaders.set('App-ID', String(game.id))
      }
    }
    return newHeaders
  }, [usePermissionApiV2, isGlobal, game, headers])

  const key = useMemo(() => {
    if (!accessible || !isValid) {
      return null
    }

    const httpOption = {
      method,
      url,
      body: _body,
      params: _params,
      headers: _headers,
    }

    const serializedKey = unstable_serialize(httpOption)
    keyMap.set(url, serializedKey)
    return serializedKey
  }, [method, url, _body, _params, _headers, isValid, accessible])

  const shouldPoll = useRef(false)

  const { data, isValidating } = useSWR(
    key,
    async () => {
      const response = await request<Response>(url, {
        method,
        body: _body,
        params: _params,
        headers: _headers,
      })

      return response.data
    },
    {
      shouldRetryOnError: false,
      revalidateOnFocus: false,
      refreshInterval: shouldPoll.current ? refreshInterval : 0,
      onSuccess(response) {
        shouldPoll.current = true
        afterSuccess?.(action.current, response)
      },
      onError() {
        shouldPoll.current = false
      },
    },
  )

  const dataSource = useMemo(() => getDataSource(data, form), [data, form, getDataSource])
  const total = useMemo(() => getTotal(data), [data, getTotal])

  const pagination = useMemo(
    () =>
      !onePage && {
        showSizeChanger: true,
        showQuickJumper: true,
        current: page,
        pageSize: size,
        total,
        onChange: async (currentPage: number, currentSize: number) => {
          action.current = QueryListAction.Jump
          refetch(url, {
            page: currentPage,
            size: currentSize,
          })
        },
      },
    [page, size, onePage, total],
  )

  const onConfirm = async () => {
    action.current = QueryListAction.Confirm
    refetch(url, {
      page: 1,
      formValue: form.getFieldsValue(),
    })

    try {
      await form.validateFields()
      setIsValid(true)
    } catch (error) {
      setIsValid(false)
    }
  }

  const onReset = async () => {
    action.current = QueryListAction.Reset
    form.resetFields()
    refetch(url, {
      page: 1,
      formValue: form.getFieldsValue(),
    })

    try {
      await form.validateFields({ validateOnly: true })
      setIsValid(true)
    } catch (error) {
      setIsValid(false)
    }
  }

  useEffect(() => {
    // 在表单字段注册到 Form 实例前调用 validateFields 会得到错误的结果，所以需要延迟调用。
    const timer = setTimeout(async () => {
      try {
        form.resetFields()
        await form.validateFields({ validateOnly: true })
        setIsValid(true)
      } catch (err) {
        setIsValid(false)
      }
    }, 0)

    return () => {
      clearTimeout(timer)
    }
  }, [form, game])

  useImperativeHandle(ref, () => ({
    response: data,
    dataSource,
    form,
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

  const formRenderer = typeof renderForm === 'function' && (
    <FilterFormWrapper buttonsAlign={buttonsAlign} isConfirming={isValidating} onReset={onReset} onConfirm={onConfirm}>
      {cloneElement(renderForm(form), {
        onKeyUp: (e: KeyboardEvent) => {
          if (e.key === 'Enter') {
            onConfirm()
          }
        },
      })}
    </FilterFormWrapper>
  )

  const extraRenderer = extra && <div className="mt-2 mb-4">{extra({ form, data: originalData.current })}</div>

  return (
    <div>
      {formRenderer}
      {extraRenderer}
      {typeof tableExtra === 'function' ? tableExtra(form) : tableExtra}
      <Table {...tableProps} dataSource={dataSource} loading={isValidating} pagination={pagination} />
    </div>
  )
}

const QueryList = forwardRef(InternalQueryList) as <
  Item extends AnyObject = AnyObject,
  Value extends object | undefined = undefined,
  Response = ListResponse<Item>,
>(
  props: QueryListProps<Item, Value, Response> & { ref?: Ref<QueryListRef<Item, Value, Response>> },
) => ReactElement

export default QueryList
