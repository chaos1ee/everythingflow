import { usePermission } from '@/hooks'
import type { QueryListStoreValue } from '@/stores'
import { useQueryListStore } from '@/stores'
import type { ListResponse } from '@/types'
import type { FormInstance, TablePaginationConfig } from 'antd'
import { Form, Result, Table } from 'antd'
import type { TableProps } from 'antd/es/table'
import type { ReactNode } from 'react'
import { useCallback, useEffect, useRef } from 'react'
import type { FilterFormWrapperProps } from '@/components'
import { FilterFormWrapper, useToolkitContextStore } from '@/components'
import useSWR from 'swr'
import { request } from '@/utils'

export enum QueryListAction {
  Submit = 'submit',
  Reset = 'reset',
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
  const { accessible } = usePermission(code)
  const [internalForm] = Form.useForm<Values>(form)
  const { getParams, setParams } = useQueryListStore()
  const actionRef = useRef<QueryListAction>()
  const listParams = getParams(url)
  const skipFetch = useRef(true)
  const { isGlobalNS } = useToolkitContextStore(state => state)

  const set = useCallback(
    (value: Partial<QueryListStoreValue>, opts?: { skipFetch: boolean }) => {
      skipFetch.current = !!opts?.skipFetch
      setParams(url, value)
    },
    [url, setParams],
  )

  const swrKey: null | [string, QueryListStoreValue] = skipFetch.current ? null : [url, listParams]

  const { data, isLoading, mutate } = useSWR(
    swrKey,
    async arg => {
      try {
        const { page, size, formValues } = arg[1]

        const params = transformArg?.(page, size, formValues) ?? {
          ...formValues,
          page,
          size,
        }

        const response = await request<Response>(arg[0], { headers, params }, isGlobalNS)
        const list = transformResponse?.(response) ?? (response as ListResponse<Item>)
        afterSuccess?.(list, actionRef.current)
        return list
      } catch (err) {
        console.error(err)
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
    current: listParams.page,
    pageSize: listParams.size,
    total: data?.total,
    onChange: onPaginationChange,
  }

  const afterConfirm = async () => {
    actionRef.current = QueryListAction.Submit
    set({
      page: 1,
      formValues: internalForm.getFieldsValue(),
    })
  }

  const afterReset = async () => {
    try {
      actionRef.current = QueryListAction.Reset
      internalForm.resetFields()
      const values = await internalForm.validateFields()
      set({
        page: 1,
        formValues: values,
      })
    } catch (_) {
      const values = internalForm.getFieldsValue()
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
        const values = await internalForm.validateFields()
        set({
          formValues: values,
        })
      } catch (_) {
        internalForm.resetFields()
      }
    }

    // 增加延时，防止回调在表单实例化前触发
    setTimeout(init)
  }, [internalForm, set])

  if (!accessible) {
    return <Result status={403} subTitle="无权限，请联系管理员进行授权" />
  }

  return (
    <>
      <FilterFormWrapper
        form={internalForm}
        confirmText={confirmText}
        afterReset={afterReset}
        afterConfirm={afterConfirm}
      >
        {renderForm}
      </FilterFormWrapper>
      <Table {...tableProps} dataSource={data?.list} loading={isLoading} pagination={pagination} />
    </>
  )
}

export default QueryList
