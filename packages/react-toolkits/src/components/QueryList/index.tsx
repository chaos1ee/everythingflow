import { useHttpClient, usePermission } from '@/hooks'
import type { QueryListStoreValue } from '@/stores'
import { useQueryListStore } from '@/stores'
import type { ListResponse } from '@/types'
import type { TablePaginationConfig } from 'antd'
import { Form, Result, Table } from 'antd'
import type { TableProps } from 'antd/es/table'
import type { PropsWithChildren } from 'react'
import { useCallback, useEffect, useRef } from 'react'
import type { FilterFormWrapperProps } from '@/components'
import { FilterFormWrapper } from '@/components'
import useSWR from 'swr'

export enum QueryListAction {
  Submit = 'submit',
  Reset = 'reset',
}

export interface QueryListProps<Item, Values, Response>
  extends Pick<TableProps<Item>, 'columns' | 'rowKey' | 'tableLayout' | 'expandable' | 'rowSelection' | 'bordered'>,
    Pick<FilterFormWrapperProps, 'confirmText'> {
  url: string
  code?: string
  headers?: Record<string, string>
  // 把表单的值和分页数据转换成请求参数
  transformArg?: (page: number, size: number, values: Values) => unknown
  // 当请求的返回值不满足时进行转换
  transformResponse?: (response: Response) => ListResponse<Item>
  afterSuccess?: (response: ListResponse<Item>, action?: QueryListAction) => void
}

const QueryList = <Item extends object, Values extends object | undefined, Response = ListResponse<Item>>(
  props: PropsWithChildren<QueryListProps<Item, Values, Response>>,
) => {
  const { code, confirmText, url, headers, children, transformArg, transformResponse, afterSuccess, ...tableProps } =
    props
  const { accessible } = usePermission(code ?? '')
  const form = Form.useFormInstance<Values>()
  const { getData, setData } = useQueryListStore(state => state)
  const actionRef = useRef<QueryListAction>()
  const httpClient = useHttpClient()
  const listData = getData(url)
  const skipFetch = useRef(true)

  const set = useCallback(
    (value: Partial<QueryListStoreValue>, opts?: { skipFetch: boolean }) => {
      skipFetch.current = !!opts?.skipFetch
      setData(url, value)
    },
    [url, setData],
  )

  const swrKey: null | [string, QueryListStoreValue] = skipFetch.current ? null : [url, listData]

  const { data, isLoading, mutate } = useSWR(
    swrKey,
    async arg => {
      const { page, size, formValues } = arg[1]

      const params = transformArg?.(page, size, formValues) ?? {
        ...formValues,
        page,
        size,
      }

      try {
        const response = await httpClient.get<Response>(arg[0], { params, headers })
        const list = transformResponse?.(response) ?? (response as ListResponse<Item>)
        afterSuccess?.(list, actionRef.current)
        return list
      } finally {
        actionRef.current = undefined
      }
    },
    {
      shouldRetryOnError: false,
      revalidateOnFocus: false,
    },
  )

  const onPaginationChange = async (currentPage: number, currentSize: number) => {
    set({
      page: currentPage,
      size: currentSize,
    })
  }

  const pagination: TablePaginationConfig = {
    showSizeChanger: true,
    showQuickJumper: true,
    current: listData.page,
    pageSize: listData.size,
    total: data?.total,
    onChange: onPaginationChange,
  }

  const afterConfirm = async () => {
    actionRef.current = QueryListAction.Submit
    set({
      page: 1,
      formValues: form.getFieldsValue(),
    })
  }

  const afterReset = async () => {
    try {
      actionRef.current = QueryListAction.Reset
      form.resetFields()
      const values = await form.validateFields()
      set({
        page: 1,
        formValues: values,
      })
    } catch (_) {
      const values = form.getFieldsValue()
      set(
        {
          page: 1,
          formValues: values,
        },
        { skipFetch: true },
      )
      await mutate(
        {
          list: [],
          total: 0,
        },
        {
          revalidate: false,
        },
      )
    }
  }

  useEffect(() => {
    const init = async () => {
      try {
        const values = await form.validateFields()
        set({
          formValues: values,
        })
      } catch (_) {
        form.resetFields()
      }
    }

    // 增加延时，防止回调在表单实例化前触发
    setTimeout(init)
  }, [form, set])

  if (!accessible) {
    return <Result status={403} subTitle="无权限，请联系管理员进行授权" />
  }

  return (
    <>
      <FilterFormWrapper confirmText={confirmText} afterReset={afterReset} afterConfirm={afterConfirm}>
        {children}
      </FilterFormWrapper>
      <Table {...tableProps} dataSource={data?.list} loading={isLoading} pagination={pagination} />
    </>
  )
}

export default QueryList
