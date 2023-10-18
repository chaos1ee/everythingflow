import type { ListResponse } from '@/types'
import type { FormInstance, TablePaginationConfig } from 'antd'
import { Form, Result, Spin, Table } from 'antd'
import type { TableProps } from 'antd/es/table'
import type { ReactNode } from 'react'
import { useEffect, useRef, useState } from 'react'
import { useTranslation } from '@/utils/i18n'
import FilterFormWrapper from '@/components/FilterFormWrapper'
import { usePermission } from '@/hooks/permission'
import { request } from '@/utils/request'
import useSWR from 'swr'
import { useGameStore } from '@/components/GameSelect'
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
  const { accessible, isValidating } = usePermission(code, { isGlobalNS })
  const [form] = Form.useForm<Values>()
  const action = useRef<QueryListAction>()
  const t = useTranslation()
  const { game } = useGameStore()
  const [page, setPage] = useState(1)
  const [size, setSize] = useState(10)
  const [formValues, setFormValues] = useState<Values>()
  const [isValid, setIsValid] = useState(false)
  const params = transformArg?.(page, size, formValues) ?? {
    ...formValues,
    page,
    size,
  }

  const parsed = qs.parseUrl(url)
  const queryParams = Object.assign({}, parsed.query, params)
  const queryString = qs.stringify(queryParams)
  const swrKey = isValid ? `${parsed.url}?${queryString}` : null

  const { data, isLoading } = useSWR(
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
      keepPreviousData: false,
      fallbackData,
    },
  )

  const onPaginationChange = async (currentPage: number, currentSize: number) => {
    action.current = QueryListAction.Jump
    setPage(currentPage)
    setSize(currentSize)
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
    const values = form.getFieldsValue()
    setFormValues(values)
    setPage(1)

    try {
      await form.validateFields()
      setIsValid(true)
    } catch (_) {
      setIsValid(false)
    }
  }

  const onReset = async () => {
    action.current = QueryListAction.Reset
    form.resetFields()
    const values = form.getFieldsValue()
    setFormValues(values)
    setPage(1)

    try {
      await form.validateFields()
      setIsValid(true)
    } catch (_) {
      setIsValid(false)
    }
  }

  useEffect(() => {
    const init = async () => {
      if (accessible) {
        action.current = QueryListAction.Init
        const values = form.getFieldsValue()
        setFormValues(values)

        try {
          await form.validateFields()
          setIsValid(true)
        } catch (_) {
          form.resetFields()
          setIsValid(false)
        }
      }
    }

    init()
  }, [accessible, form, game])

  useEffect(() => {
    useQueryListStore.setState(prev => ({
      cacheMap: new Map(prev.cacheMap).set(url, {
        swrKey,
        setPage,
        setSize,
      }),
    }))
  }, [swrKey, url])

  if (isValidating) {
    return (
      <Spin
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: 200,
        }}
      />
    )
  }

  if (!accessible) {
    return <Result status={403} subTitle={t('noEntitlement')} />
  }

  return (
    <>
      {renderForm && (
        <FilterFormWrapper confirmText={confirmText} onReset={onReset} onConfirm={onConfirm}>
          {renderForm(form)}
        </FilterFormWrapper>
      )}
      <Table {...tableProps} dataSource={data?.list} loading={isLoading} pagination={pagination} />
    </>
  )
}

export default QueryList
