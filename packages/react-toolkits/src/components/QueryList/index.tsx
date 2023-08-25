import { useHttpClient, usePermission } from '@/hooks'
import { useQueryListStore } from '@/stores'
import type { ListResponse, PaginationParams } from '@/types'
import type { FormInstance, FormProps } from 'antd'
import { Form, Result, Table } from 'antd'
import type { TableProps } from 'antd/es/table'
import type { AxiosRequestConfig } from 'axios'
import type { ReactNode } from 'react'
import { useCallback, useEffect } from 'react'
import useSWRMutation from 'swr/mutation'
import FilterForm from '../FilterForm'
import type { Merge } from 'ts-essentials'

export type QueryListKey = Omit<AxiosRequestConfig, 'data' | 'params'>

export interface QueryListProps<Item, Values, Response>
  extends Pick<TableProps<Item>, 'columns' | 'rowKey' | 'tableLayout' | 'expandable' | 'rowSelection' | 'bordered'>,
    Pick<FormProps<Values>, 'initialValues' | 'labelCol'> {
  // 由于表单的值和分页数据是封装在组件内部的，不便于在组件外部构造 swr key，
  // 所以组件内部的 useSWRMutation hook 使用的 key 是不包含表单值和分页参数的。
  // 因此 swr 并未按照分页缓存数据。
  swrKey: QueryListKey
  confirmText?: ReactNode
  code?: string
  renderForm?: (form: FormInstance<Values>) => ReactNode
  // 把表单的值和分页数据转换成请求参数
  transformArg?: (arg: Merge<Values, PaginationParams>) => unknown
  // 当请求的返回值不满足时进行转换
  transformResponse?: (response: Response) => ListResponse<Item>
}

const QueryList = <Item extends object, Values = NonNullable<unknown>, Response = ListResponse<Item>>(
  props: QueryListProps<Item, Values, Response>,
) => {
  const {
    code,
    confirmText,
    labelCol,
    swrKey,
    initialValues,
    renderForm,
    transformArg,
    transformResponse,
    ...tableProps
  } = props
  const { accessible } = usePermission(code ?? '')
  const [form] = Form.useForm<Values>()
  const setRefresh = useQueryListStore(state => state.setRefresh)
  const getPaginationData = useQueryListStore(state => state.getPaginationData)
  const setPaginationData = useQueryListStore(state => state.setPaginationData)
  const paginationData = getPaginationData(swrKey)

  const httpClient = useHttpClient()

  const { data, isMutating, trigger } = useSWRMutation(
    swrKey,
    async (key, { arg }: { arg?: Partial<PaginationParams> }) => {
      const newPaginationData = {
        page: arg?.page ?? paginationData.page,
        size: arg?.size ?? paginationData.size,
      }

      setPaginationData(swrKey, arg)

      const values = form.getFieldsValue()

      const _arg = {
        ...values,
        ...newPaginationData,
      }

      return httpClient
        .request<Response>({
          ...key,
          [key.method === 'POST' ? 'data' : 'params']: transformArg?.(_arg) ?? _arg,
        })
        .then(response => transformResponse?.(response) ?? (response as ListResponse<Item>))
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
        size: currentSize,
      })
    },
    [trigger],
  )

  useEffect(() => {
    setRefresh(swrKey, trigger)
  }, [swrKey, trigger, setRefresh])

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
          pageSize: paginationData.size,
          total: data?.Total,
          onChange: onPaginationChange,
        }}
      />
    </>
  )
}

export default QueryList
