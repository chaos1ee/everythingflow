import type { ListResponse } from '@/types'
import type { FormInstance, TablePaginationConfig } from 'antd'
import { Form, Result, Spin, Table } from 'antd'
import type { TableProps } from 'antd/es/table'
import type { ReactNode } from 'react'
import { useCallback, useEffect, useRef } from 'react'
import useSWR from 'swr'
import { useTranslation } from '@/utils/i18n'
import type { FilterFormWrapperProps } from '@/components/FilterFormWrapper'
import FilterFormWrapper from '@/components/FilterFormWrapper'
import { usePermission } from '@/hooks/permission'
import { useQueryListStore, useQueryListTrigger } from '@/stores/queryList'
import { useToolkitsContext } from '@/components/ContextProvider'
import { request } from '@/utils/request'

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
  extends Pick<TableProps<Item>, 'columns' | 'rowKey' | 'tableLayout' | 'expandable' | 'rowSelection' | 'bordered'>,
    Pick<FilterFormWrapperProps<Values>, 'confirmText'> {
  url: string
  code?: string
  headers?: Record<string, string>
  form?: FormInstance<Values>
  renderForm?: (form: FormInstance<Values>) => ReactNode
  // 把表单的值和分页数据转换成请求参数
  transformArg?: (page: number, size: number, values: Values) => unknown
  // 当请求的返回值不满足时进行转换
  transformResponse?: (response: Response) => ListResponse<Item>
  afterSuccess?: (response: ListResponse<Item>, action?: QueryListAction) => void
}

const QueryList = <Item extends object, Values extends object | undefined, Response = ListResponse<Item>>(
  props: QueryListProps<Item, Values, Response>,
) => {
  const {
    code,
    confirmText,
    url,
    headers,
    form,
    renderForm,
    transformArg,
    transformResponse,
    afterSuccess,
    ...tableProps
  } = props
  const { accessible, isValidating } = usePermission(code)
  const [internalForm] = Form.useForm<Values>(form)
  const { payloadMap } = useQueryListStore()
  const { isGlobalNS } = useToolkitsContext()
  const action = useRef<QueryListAction>()
  const trigger = useQueryListTrigger()
  const t = useTranslation()

  const internalTrigger = useCallback(
    (...params: Parameters<typeof trigger> extends [infer _, ...infer Rest] ? Rest : never) => {
      trigger(url, ...params)
    },
    [trigger, url],
  )

  const payload = payloadMap.get(url)

  const { data, isLoading } = useSWR(
    { url, payload },
    async arg => {
      const { page = 1, size = 10, values } = arg.payload ?? {}

      const params = transformArg?.(page, size, values) ?? {
        ...values,
        page,
        size,
      }

      const response = await request<Response>(arg.url, { headers, params }, isGlobalNS)
      const list = transformResponse?.(response.data) ?? (response.data as ListResponse<Item>)
      afterSuccess?.(list, action.current)
      action.current = undefined
      return list
    },
    {
      shouldRetryOnError: false,
      keepPreviousData: true,
      fallbackData,
      revalidateOnMount: false,
    },
  )

  const onPaginationChange = async (currentPage: number, currentSize: number) => {
    action.current = QueryListAction.Jump
    internalTrigger({
      page: currentPage,
      size: currentSize,
    })
  }

  const pagination: TablePaginationConfig = {
    showSizeChanger: true,
    showQuickJumper: true,
    current: payload?.page,
    pageSize: payload?.size,
    total: data?.total,
    onChange: onPaginationChange,
  }

  const afterConfirm = async (values: Values) => {
    action.current = QueryListAction.Confirm
    internalTrigger({
      page: 1,
      values,
    })
  }

  const afterReset = async (values: Values) => {
    action.current = QueryListAction.Reset
    try {
      await internalForm.validateFields()
      internalTrigger({ page: 1, values })
    } catch (_) {
      internalTrigger({ page: 1, values }, fallbackData, { revalidate: false })
    }
  }

  useEffect(() => {
    const init = async () => {
      action.current = QueryListAction.Init

      try {
        const values = await internalForm.validateFields()
        internalTrigger({ values })
      } catch (_) {
        internalForm.resetFields()
      }
    }

    // 在不使用定时器时 Form.Item 的自定义校验有时不会被触发
    setTimeout(init, 0)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

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
        <FilterFormWrapper
          form={internalForm}
          confirmText={confirmText}
          afterReset={afterReset}
          afterConfirm={afterConfirm}
        >
          {renderForm(internalForm)}
        </FilterFormWrapper>
      )}
      <Table {...tableProps} dataSource={data?.list} loading={isLoading} pagination={pagination} />
    </>
  )
}

export default QueryList
