import { useHttpClient, usePermission } from '@/hooks'
import { useQueryTriggerStore } from '@/stores'
import type { ListResponse, PaginationParams } from '@/types'
import type { FormInstance, FormProps } from 'antd'
import { Form, Result, Table } from 'antd'
import type { TableProps } from 'antd/es/table'
import type { AxiosRequestConfig } from 'axios'
import type { ReactNode } from 'react'
import { useCallback, useEffect, useState } from 'react'
import useSWRMutation from 'swr/mutation'
import FilterForm from '../FilterForm'

export type QueryListKey = Omit<AxiosRequestConfig, 'data' | 'params'>

export interface QueryListProps<Item, Values>
  extends Pick<TableProps<Item>, 'columns' | 'rowKey' | 'tableLayout' | 'expandable' | 'rowSelection' | 'bordered'>,
    Pick<FormProps<Values>, 'initialValues' | 'labelCol'> {
  // 由于表单的值和分页数据是封装在组件内部的，不便于在组件外部构造 swr key，所以组件内部的 useSWRMutation hook 使用的 key 是排除了 arg 字段的。
  // 因此 swr 的缓存并未发挥作用，同一个 key 的所有页面共享缓存。
  swrKey: QueryListKey
  confirmText?: ReactNode
  code?: string
  renderForm?: (form: FormInstance<Values>) => ReactNode
  // 把表单的值和分页数据转换成请求参数
  transformArg?: (arg: Values & PaginationParams) => unknown
}

const QueryList = <Item extends object, Values = NonNullable<unknown>>(props: QueryListProps<Item, Values>) => {
  const { code, confirmText, labelCol, swrKey, renderForm, transformArg, initialValues, ...tableProps } = props
  const { accessible } = usePermission(code ?? '')
  const [form] = Form.useForm<Values>()
  const setTrigger = useQueryTriggerStore(state => state.setTrigger)

  const [paginationData, setPaginationData] = useState<PaginationParams>({
    page: 1,
    perPage: 10,
  })

  const httpClient = useHttpClient()

  const { data, isMutating, trigger } = useSWRMutation(
    swrKey,
    async (
      key,
      {
        arg,
      }: {
        arg?: Partial<PaginationParams>
      },
    ) => {
      const newPaginationData = {
        page: arg?.page ?? paginationData.page ?? 1,
        perPage: arg?.perPage ?? paginationData.perPage ?? 10,
      }

      setPaginationData(newPaginationData)

      const values = form.getFieldsValue()

      const fetcherArg = {
        ...values,
        ...newPaginationData,
      }

      return httpClient.request<ListResponse<Item>>({
        ...key,
        [key.method === 'POST' ? 'data' : 'params']:
          typeof transformArg === 'function' ? transformArg(fetcherArg) : fetcherArg,
      })
    },
  )

  const onFinish = async () => {
    await trigger({ page: 1 })
  }

  const onReset = useCallback(async () => {
    try {
      form.resetFields()
      await form.validateFields()
      await trigger({ page: 1 })
    } catch (_) {
      console.log('表单校验失败')
    }
  }, [form, trigger])

  const onPaginationChange = useCallback(
    async (currentPage: number, currentSize: number) => {
      await trigger({
        page: currentPage,
        perPage: currentSize,
      })
    },
    [trigger],
  )

  useEffect(() => {
    setTrigger(swrKey, trigger)
  }, [swrKey, trigger, setTrigger])

  useEffect(() => {
    ;(async () => {
      try {
        await form.validateFields()
        await trigger()
      } catch (_) {
        form.resetFields()
      }
    })()
  }, [form, trigger])

  if (!accessible) {
    return <Result status={403} subTitle="无权限，请联系管理员进行授权" />
  }

  return (
    <>
      <FilterForm<Values>
        initialValues={initialValues}
        form={form}
        labelCol={labelCol}
        confirmText={confirmText}
        onFinish={onFinish}
        onReset={onReset}
      >
        {renderForm?.(form)}
      </FilterForm>
      <Table
        {...tableProps}
        dataSource={data?.List}
        loading={isMutating}
        pagination={{
          showSizeChanger: true,
          showQuickJumper: true,
          current: paginationData.page,
          pageSize: paginationData.perPage,
          total: data?.Total,
          onChange: onPaginationChange,
        }}
      />
    </>
  )
}

export default QueryList
