import type { ListResponse } from '@/types'
import type { FormInstance, TablePaginationConfig } from 'antd'
import { Form, Result, Spin, Table } from 'antd'
import type { TableProps } from 'antd/es/table'
import type { ReactNode } from 'react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useTranslation } from '@/utils/i18n'
import FilterFormWrapper from '@/components/FilterFormWrapper'
import { usePermission } from '@/hooks/permission'
import { request } from '@/utils/request'
import useSWR, { useSWRConfig } from 'swr'
import qs from 'query-string'
import { useQueryListStore } from '@/stores/queryList'

export enum QueryListAction {
  Confirm = 'confirm',
  Reset = 'reset',
  Jump = 'jump',
  Init = 'init',
}

const fallbackData = {
  list: [],
  total: 0,
}

export interface QueryListProps<Item, Values, Response>
  extends Pick<TableProps<Item>, 'columns' | 'rowKey' | 'tableLayout' | 'expandable' | 'rowSelection' | 'bordered'> {
  url: string
  code?: string
  isGlobalNS?: boolean
  headers?: Record<string, string>
  renderForm?: (form: FormInstance<Values>) => ReactNode
  // 把表单的值和分页数据转换成请求参数
  transformArg?: (page: number, size: number, values: Values | undefined) => unknown
  // 当请求的返回值不满足时进行转换
  transformResponse?: (response: Response) => ListResponse<Item>
  afterSuccess?: (response: ListResponse<Item>, action?: QueryListAction) => void
  confirmText?: ReactNode
}

const QueryList = <Item extends object, Values extends object | undefined, Response = ListResponse<Item>>(
  props: QueryListProps<Item, Values, Response>,
) => {
  const {
    code,
    confirmText,
    url,
    headers,
    isGlobalNS,
    renderForm,
    transformArg,
    transformResponse,
    afterSuccess,
    ...tableProps
  } = props
  const t = useTranslation()
  const { accessible, isLoading } = usePermission(code, { isGlobalNS })
  const [form] = Form.useForm<Values>()
  const action = useRef<QueryListAction>()
  const { mutate, paginationMap, keyMap } = useQueryListStore()
  const { page = 1, size = 10 } = paginationMap.get(url) ?? {}
  const [formValues, setFormValues] = useState<Values>()
  const [isValid, setIsValid] = useState(false)

  const params = transformArg?.(page, size, formValues) ?? {
    ...formValues,
    page,
    size,
  }

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
      const response = await request<Response>(key, { headers, isGlobalNS })
      const list = transformResponse?.(response.data) ?? (response.data as ListResponse<Item>)
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

  const pagination: TablePaginationConfig = {
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

  const refetch = useCallback(async () => {
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
  }, [form, _mutate])

  const onReset = () => {
    action.current = QueryListAction.Reset
    refetch()
  }

  useEffect(() => {
    if (accessible) {
      action.current = QueryListAction.Init
      refetch()
    }
  }, [accessible, url, form, refetch])

  useEffect(() => {
    keyMap.set(url, swrKey)
  }, [keyMap, swrKey, url])

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
      {renderForm && (
        <FilterFormWrapper confirmText={confirmText} onReset={onReset} onConfirm={onConfirm}>
          {renderForm(form)}
        </FilterFormWrapper>
      )}
      <Table
        {...tableProps}
        dataSource={data?.list}
        loading={refreshInterval === 0 ? isDataValidating : isDataLoading}
        pagination={pagination}
      />
    </div>
  )
}

export default QueryList
