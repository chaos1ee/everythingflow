/* eslint-disable @typescript-eslint/no-explicit-any */
import FilterFormWrapper from '@/components/FilterFormWrapper'
import { usePermission } from '@/hooks/permission'
import { useQueryListStore } from '@/stores/queryList'
import type { ListResponse } from '@/types'
import { useTranslation } from '@/utils/i18n'
import { request } from '@/utils/request'
import type { FormInstance } from 'antd'
import { Form, Result, Spin, Table } from 'antd'
import type { NamePath } from 'antd/es/form/interface'
import type { TableProps } from 'antd/es/table'
import qs from 'query-string'
import type { ReactElement, ReactNode, Ref } from 'react'
import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react'
import useSWR, { useSWRConfig } from 'swr'

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
  url: string
  renderForm?: (form: FormInstance<Values>) => ReactNode
  code?: string
  isGlobalNS?: boolean
  headers?: Record<string, string>
  // 把表单的值和分页数据转换成请求参数
  transformArg?: (page: number, size: number, values: Values | undefined) => unknown
  // 当请求的返回值不满足时进行转换
  transformResponse?: (response: Response) => ListResponse<Item>
  afterSuccess?: (response: ListResponse<Item>, action?: QueryListAction) => void
  confirmText?: ReactNode
  // 不分页
  noPagination?: boolean
  extra?: (response: Response | undefined, form: FormInstance<Values>) => ReactNode
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
    url,
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
    ...tableProps
  } = props
  const t = useTranslation()
  const [form] = Form.useForm<Values>()
  const { accessible, isLoading } = usePermission(code, { isGlobalNS })
  const action = useRef<QueryListAction>()
  const { mutate, paginationMap, keyMap } = useQueryListStore()
  const { page = 1, size = 10 } = paginationMap.get(url) ?? {}
  const [formValues, setFormValues] = useState<Values>()
  const [isValid, setIsValid] = useState(false)
  const [response, setResponse] = useState<Response>()

  const params =
    transformArg?.(page, size, formValues) ??
    (noPagination
      ? formValues
      : {
          ...formValues,
          page,
          size,
        })

  const _mutate = useCallback(
    (...args: Parameters<typeof mutate> extends [infer _, ...infer Rest] ? Rest : never) => mutate(url, ...args),
    [mutate, url],
  )

  const parsed = qs.parseUrl(url)
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
      const _response = await request<Response>(key, { headers, isGlobalNS })
      setResponse(_response.data)
      const list = transformResponse?.(_response.data) ?? _response.data
      afterSuccess?.(list, action.current)
      action.current = undefined
      return list
    },
    {
      shouldRetryOnError: false,
      fallbackData,
    },
  )

  const onPaginationChange = async (currentPage: number, currentSize: number) => {
    action.current = QueryListAction.Jump
    _mutate({ page: currentPage, size: currentSize })
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
    action.current = QueryListAction.Confirm
    setFormValues(form.getFieldsValue())

    try {
      await form.validateFields()
      _mutate({ page: 1 }, undefined, { revalidate: true })
      setIsValid(true)
    } catch (_) {
      _mutate({ page: 1 }, undefined, { revalidate: false })
      setIsValid(false)
    }
  }

  const refetch = async () => {
    form.resetFields()
    setFormValues(form.getFieldsValue())

    try {
      await form.validateFields()
      _mutate({ page: 1 }, undefined, { revalidate: true })
      setIsValid(true)
    } catch (_) {
      form.resetFields()
      _mutate({ page: 1 }, undefined, { revalidate: false })
      setIsValid(false)
    }
  }

  const onReset = () => {
    action.current = QueryListAction.Reset
    refetch()
  }

  useEffect(() => {
    if (accessible) {
      action.current = QueryListAction.Init
      refetch()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessible])

  useEffect(() => {
    keyMap.set(url, swrKey)
  }, [keyMap, swrKey, url])

  useImperativeHandle(ref, () => ({
    form,
    setFieldValue: (name: NamePath, value: any) => {
      form.setFieldValue(name, value)
      setFormValues(form.getFieldsValue())
    },
    setFieldsValue: (values: RecursivePartial<Values>) => {
      form.setFieldsValue(values)
      setFormValues(form.getFieldsValue())
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
    return <Result status={403} subTitle={t('noEntitlement')} />
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
      {extra && <div className="my-2">{extra(response, form)}</div>}
      <Table
        {...tableProps}
        dataSource={data?.list}
        loading={refreshInterval === 0 ? isDataValidating : isDataLoading}
        pagination={pagination}
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
