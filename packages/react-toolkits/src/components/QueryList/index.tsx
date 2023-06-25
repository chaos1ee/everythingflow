import type { QueryFunction } from '@tanstack/react-query'
import { useQuery } from '@tanstack/react-query'
import type { FormInstance } from 'antd'
import { Button, Col, Form, Result, Row, Space, Spin, Table, theme } from 'antd'
import type { TableProps } from 'antd/es/table'
import type { ReactNode } from 'react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { usePermission } from '../../hooks'
import type { PaginationProps } from 'antd/es/pagination'
import { SearchOutlined } from '@ant-design/icons'

type FunctionType<Values> = (form: FormInstance<Values>) => ReactNode

type QueryType = (params: any) => {
  queryKey: any
  queryFn: QueryFunction<any, any>
}

export interface QueryListProps<Resource extends object, Values extends object, Response = ListResponse<Resource>>
  extends Pick<TableProps<Resource>, 'rowKey' | 'columns' | 'expandable'> {
  code?: string
  query: QueryType
  isGlobalNS?: boolean
  extra?: (form: FormInstance<Values>) => JSX.Element
  filterRender?: FunctionType<Values> | ReactNode
  tableLayout?: TableProps<Resource>['tableLayout']
  // 请求参数格式化
  requestFormatter?: (values: PaginationParams<Values>) => any
  // 返回数据格式化
  responseFormatter?: (response: Response) => ListResponse<Resource>
}

const QueryList = <Resource extends object, Values extends object, Response = ListResponse<Resource>>(
  props: QueryListProps<Resource, Values, Response>,
) => {
  const {
    code,
    rowKey,
    columns,
    isGlobalNS,
    filterRender,
    tableLayout,
    expandable,
    extra,
    query,
    requestFormatter,
    responseFormatter,
  } = props
  const { accessible, isValidating } = usePermission(code, isGlobalNS)
  const { token } = theme.useToken()
  const [form] = Form.useForm<Values>()
  const [allowFetching, setAllowFetching] = useState(false)
  const [formValues, setFormValues] = useState<Values>({} as Values)
  const [paginationParams, setPaginationParams] = useState<PaginationParams>({
    page: 1,
    size: 10,
  })

  const params = useMemo(
    () =>
      Object.assign(
        {},
        // TODO: 为了方便所有请求默认携带了分页参数 page、size，后续去掉
        typeof requestFormatter === 'function'
          ? requestFormatter(Object.assign({}, formValues, paginationParams))
          : formValues,
        paginationParams,
      ),
    [formValues, paginationParams, requestFormatter],
  )

  const { queryKey, queryFn } = query(params)

  const { data, isLoading } = useQuery<ListResponse<Response>, any, any, any>({
    enabled: !isValidating && accessible && allowFetching,
    queryKey,
    queryFn: () =>
      Promise.resolve(queryFn(params)).then(res => {
        if (typeof responseFormatter === 'function') {
          return responseFormatter(res)
        }
        return res
      }),
    initialData: () => {
      return {
        Page: 1,
        PerPage: 10,
        List: [],
      }
    },
  })

  const formStyle = {
    maxWidth: 'none',
    background: token.colorFillAlter,
    borderRadius: token.borderRadiusLG,
    padding: 24,
  }

  const pagination = useMemo<PaginationProps>(() => {
    return {
      showSizeChanger: true,
      showQuickJumper: true,
      current: paginationParams.page,
      pageSize: paginationParams.size,
      total: data?.Total,
      onChange(currentPage, currentSize) {
        setPaginationParams({
          page: currentPage,
          size: currentSize,
        })
      },
    }
  }, [data, paginationParams])

  const onFinish = useCallback(
    (values: Values) => {
      if (!allowFetching) {
        setAllowFetching(true)
      }

      setFormValues(prev => ({
        ...prev,
        ...values,
      }))

      setPaginationParams(prev => ({
        ...prev,
        page: 1,
      }))
    },
    [allowFetching],
  )

  const onChange = () => {
    console.log('onChange')
    setAllowFetching(false)
  }

  useEffect(() => {
    // 组件 mount 且表单校验通过时触发一次查询
    // 如果不设置定时，form.validateFields 会返回 Promise.resolve，即使校验没有通过。
    setTimeout(async () => {
      try {
        const values = await form.validateFields()
        setFormValues(prev => ({
          ...prev,
          ...values,
        }))
        setAllowFetching(true)
      } catch (_) {
        form.resetFields()
      }
    }, 800)
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
    return <Result status={403} subTitle="无权限，请联系管理员进行授权" />
  }

  return (
    <>
      {filterRender && (
        <div className="mb-6">
          <Form style={formStyle} form={form} autoComplete="off" onFinish={onFinish} onChange={onChange}>
            <Row gutter={18}>
              {typeof filterRender === 'function' ? filterRender(form) : filterRender}
              <Col flex="auto" />
              <Col flex="auto" span={24} style={{ textAlign: 'right' }}>
                <Space>
                  <Button type="primary" htmlType="submit" icon={<SearchOutlined />}>
                    查询
                  </Button>
                  <Button htmlType="reset">重置</Button>
                </Space>
              </Col>
            </Row>
          </Form>
        </div>
      )}
      {extra && <div className="mb-4">{extra(form)}</div>}
      <Table
        rowKey={rowKey}
        columns={columns}
        tableLayout={tableLayout}
        dataSource={data?.List}
        loading={isLoading}
        expandable={expandable}
        pagination={pagination}
      />
    </>
  )
}

export default QueryList
