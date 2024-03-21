/* eslint-disable @typescript-eslint/no-explicit-any */
import type { FormInstance } from 'antd'
import { Button, Form, Result, Spin, Table } from 'antd'
import type { TableProps } from 'antd/es/table'
import qs from 'query-string'
import type { Key, ReactNode } from 'react'
import { useEffect, useState } from 'react'
import useSWRInfinite from 'swr/infinite'
import { useTranslation } from '../../hooks/i18n'
import { usePermission } from '../../hooks/permission'
import { request } from '../../utils/request'
import FilterFormWrapper from '../FilterFormWrapper'

interface InfiniteListExtra<Values> {
  key: Key
  children: ReactNode | ((form: FormInstance<Values>) => ReactNode)
}

export interface InfiniteListProps<Item, Values, Response>
  extends Pick<TableProps<Item>, 'columns' | 'rowKey' | 'tableLayout' | 'expandable' | 'rowSelection' | 'bordered'> {
  action: string
  getRowKey: (response: Response) => any
  getDataSource: (data: Response[] | undefined) => Item[]
  code?: string
  headers?: Record<string, string> | ((form: FormInstance<Values>) => Record<string, string>)
  renderForm?: (form: FormInstance<Values>) => ReactNode
  transformArg: (values: Values | undefined, rowKey?: string) => Record<any, any>
  hasMore?: (data: Response[] | undefined) => boolean
  isGlobal?: boolean
  extras?: InfiniteListExtra<Values>[]
}

const InfiniteList = <Item extends object, Values extends object | undefined = undefined, Response = any>(
  props: InfiniteListProps<Item, Values, Response>,
) => {
  const {
    code,
    action,
    extras,
    headers,
    isGlobal,
    getRowKey,
    getDataSource,
    hasMore,
    renderForm,
    transformArg,
    ...tableProps
  } = props
  const t = useTranslation()
  const [form] = Form.useForm<Values>()
  const { accessible, isLoading } = usePermission(code)
  const [isValid, setIsValid] = useState(false)
  const [formValues, setFormValues] = useState<Values>()

  const getKey = (pageIndex: number, previousPageData: Response) => {
    if (!isValid) return null

    const args = transformArg(formValues, pageIndex !== 0 ? getRowKey(previousPageData) : undefined)
    const queryString = qs.stringify(args)

    return queryString ? `${action}?${qs.stringify(args)}` : action
  }

  const {
    data,
    size,
    setSize,
    isValidating: isListValidating,
  } = useSWRInfinite(
    getKey,
    arg =>
      request<Response>(arg, {
        headers: typeof headers === 'function' ? headers(form) : headers,
        isGlobal,
      }).then(response => response.data),
    {
      shouldRetryOnError: false,
      revalidateOnFocus: false,
      revalidateFirstPage: false,
    },
  )

  const dataSource = getDataSource(data)
  const isLoadingMore = isListValidating || (size > 0 && data && typeof data[size - 1] === 'undefined')
  const isReachingEnd = typeof hasMore !== 'undefined' ? !hasMore(data) : true
  const isEmpty = !dataSource || dataSource.length === 0

  const onConfirm = async () => {
    const values = await form.getFieldsValue()
    setFormValues(values)

    try {
      await form.validateFields()
      setSize(1)
      setIsValid(true)
    } catch (_) {
      setSize(0)
      setIsValid(false)
    }
  }

  const loadMore = () => {
    setSize(size + 1)
  }

  const onReset = async () => {
    try {
      form.resetFields()
      await form.validateFields({ validateOnly: true })
      setSize(1)
    } catch (_) {
      setSize(0)
    }
  }

  useEffect(() => {
    if (accessible) {
      form
        .validateFields({ validateOnly: true })
        .then(values => {
          setFormValues(values)
          setIsValid(true)
        })
        .catch(() => {
          setIsValid(false)
        })
    }
  }, [accessible])

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
    <>
      {renderForm ? (
        <FilterFormWrapper onReset={onReset} onConfirm={onConfirm}>
          {renderForm(form)}
        </FilterFormWrapper>
      ) : (
        <Form form={form} />
      )}
      <Table {...tableProps} dataSource={dataSource} loading={isLoadingMore} pagination={false} />
      {!isEmpty && (
        <Button
          block
          loading={isLoadingMore}
          type="link"
          htmlType="button"
          disabled={isLoadingMore || isReachingEnd}
          onClick={loadMore}
        >
          {isLoadingMore
            ? t('InfiniteList.loadingText')
            : isReachingEnd
              ? t('InfiniteList.reachEndText')
              : t('InfiniteList.loadMoreText')}
        </Button>
      )}
    </>
  )
}

export default InfiniteList
