/* eslint-disable @typescript-eslint/no-explicit-any */
import type { FormInstance } from 'antd'
import { Form, Result, Spin, Table } from 'antd'
import type { NamePath } from 'antd/es/form/interface'
import type { TableProps } from 'antd/es/table'
import qs from 'query-string'
import type { ReactElement, ReactNode, Ref } from 'react'
import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react'
import useSWR, { useSWRConfig } from 'swr'
import { useTranslation } from '../../hooks/i18n'
import { usePermission } from '../../hooks/permission'
import { useQueryListStore } from '../../stores/queryList'
import type { ListResponse } from '../../types'
import { request } from '../../utils/request'
import FilterFormWrapper from '../FilterFormWrapper'

type RecursivePartial<T> = NonNullable<T> extends object
  ? {
      [P in keyof T]?: NonNullable<T[P]> extends (infer U)[]
        ? RecursivePartial<U>[]
        : NonNullable<T[P]> extends object
          ? RecursivePartial<T[P]>
          : T[P]
    }
  : T

export enum QueryListAction {
  Confirm = 'confirm',
  Reset = 'reset',
  Jump = 'jump',
  Init = 'init',
}

export interface QueryListRef<Values = any> {
  form: FormInstance<Values>
  setFieldValue: (name: NamePath, value: any) => void
  setFieldsValue: (values: RecursivePartial<Values>) => void
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
  headers?: Record<string, string> | ((form: FormInstance<Values>) => Record<string, string>)
  // 把表单的值和分页数据转换成请求参数
  transformArg?: (page: number, size: number, values: Values | undefined) => unknown
  // 当请求的返回值不满足时进行转换
  transformResponse?: (response: Response) => ListResponse<Item>
  afterSuccess?: (response: ListResponse<Item>, action?: QueryListAction) => void
  confirmText?: ReactNode
  // 不分页
  noPagination?: boolean
  extra?: (response: Response | undefined, form: FormInstance<Values>) => ReactNode
  onTableChange?: TableProps<Item>['onChange']
}

const InternalQueryList = <
  Item extends object,
  Values extends object | undefined,
  Response extends ListResponse<Item> = ListResponse<Item>,
>(
  props: QueryListProps<Item, Values, Response>,
  ref: Ref<QueryListRef<Values>>,
) => {
  const {
    action,
    code,
    confirmText,
    headers,
    isGlobalNS,
    noPagination,
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
  const { accessible, isLoading } = usePermission(code, { isGlobalNS })
  const listAction = useRef<QueryListAction>()
  const { mutate, getPayload, setPayload, keyMap } = useQueryListStore()
  const { page, size, formValue } = getPayload(action)
  const [isValid, setIsValid] = useState(false)
  const [response, setResponse] = useState<Response>()

  const params =
    transformArg?.(page, size, formValue) ??
    (noPagination
      ? formValue
      : {
          ...formValue,
          page,
          size,
        })

  const createBoundAction = <T extends any[], R>(actionFn: (action: string, ...args: T) => R): ((...args: T) => R) => {
    return (...args: T) => actionFn(action, ...args)
  }

  const _setPayload = createBoundAction(setPayload)
  const _mutate = createBoundAction(mutate)

  const parsed = qs.parseUrl(action)
  const queryParams = Object.assign({}, parsed.query, params)
  const queryString = qs.stringify(queryParams)
  const swrKey = isValid ? `${parsed.url}?${queryString}` : null
  const { refreshInterval } = useSWRConfig()

  const {
    data,
    isLoading: isDataLoading,
    isValidating: isDataValidating,
  } = useSWR(
    swrKey,
    async key => {
      const _response = await request<Response>(key, {
        headers: typeof headers === 'function' ? headers(form) : headers,
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

  const onPaginationChange = async (currentPage: number, currentSize: number) => {
    listAction.current = QueryListAction.Jump
    _setPayload({
      page: currentPage,
      size: currentSize,
    })
  }

  const pagination = noPagination
    ? false
    : {
        showSizeChanger: true,
        showQuickJumper: true,
        current: page,
        pageSize: size,
        total: data?.total,
        onChange: onPaginationChange,
      }

  const onConfirm = async () => {
    listAction.current = QueryListAction.Confirm

    _setPayload({
      page: 1,
      formValue: form.getFieldsValue(),
    })

    try {
      await form.validateFields()
      setIsValid(true)
    } catch (_) {
      setIsValid(false)
      _mutate(undefined, { revalidate: false })
    }
  }

  const refetch = async () => {
    form.resetFields()
    _setPayload({
      page: 1,
      formValue: form.getFieldsValue(),
    })

    try {
      await form.validateFields()
      setIsValid(true)
    } catch (_) {
      form.resetFields()
      _mutate(undefined, { revalidate: false })
      setIsValid(false)
    }
  }

  const onReset = () => {
    listAction.current = QueryListAction.Reset
    refetch()
  }

  useEffect(() => {
    if (accessible) {
      listAction.current = QueryListAction.Init
      refetch()
    }
  }, [accessible])

  useEffect(() => {
    keyMap.set(action, swrKey)
  }, [keyMap, swrKey, action])

  useImperativeHandle(ref, () => ({
    form,
    setFieldValue: (name: NamePath, value: any) => {
      form.setFieldValue(name, value)
      _setPayload({ formValue: form.getFieldsValue() })
    },
    setFieldsValue: (values: RecursivePartial<Values>) => {
      form.setFieldsValue(values)
      _setPayload({ formValue: form.getFieldsValue() })
    },
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
        pagination={pagination}
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
  props: QueryListProps<Item, Values, Response> & { ref?: Ref<QueryListRef<Values>> },
) => ReactElement

export default QueryList
