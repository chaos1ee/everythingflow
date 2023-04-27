import type { QueryFunction, QueryKey } from '@tanstack/react-query'
import { useQuery } from '@tanstack/react-query'
import type { FormInstance, FormProps } from 'antd'
import { Button, Col, Form, Row, Space, Spin, Table } from 'antd'
import type { TableProps } from 'antd/es/table'
import { useEffect, useMemo, useState } from 'react'
import { usePermission } from '../../hooks'
import NoPermissionCover from '../NoPermissionCover/NoPermissionCover'
import type { PaginationProps } from 'antd/es/pagination'
import { SearchOutlined } from '@ant-design/icons'
import { useGames } from '../../layouts'

type RenderChildren<T> = (form: FormInstance<T>) => JSX.Element

export interface QueryListProps<R extends object, F extends object, P extends object>
  extends Pick<TableProps<R>, 'rowKey' | 'columns' | 'expandable'> {
  // 权限编码
  code?: string
  isGlobal?: boolean
  filterRender?: RenderChildren<F> | JSX.Element
  formLayout?: FormProps['layout']
  tableLayout?: TableProps<R>['tableLayout']
  query: (params: PaginationParams<F> | P) => {
    queryKey: QueryKey
    queryFn: QueryFunction<any, any>
  }
  requestFormatter?: (values: PaginationParams<F>) => P
  responseFormatter?: (response: any) => ListResponse<R>
}

const QueryList = <R extends object, F extends object, P extends object>(props: QueryListProps<R, F, P>) => {
  const [form] = Form.useForm<F>()
  const { game } = useGames()
  const {
    code,
    isGlobal,
    rowKey,
    columns,
    filterRender,
    formLayout,
    tableLayout,
    expandable,
    query,
    requestFormatter,
    responseFormatter,
  } = props
  const { accessible, isChecking } = usePermission(code as string, isGlobal)
  // TODO: save initialFilters
  const [filters, setFilters] = useState({
    page: 1,
    size: 10,
  } as PaginationParams<F>)
  const [response, setResponse] = useState<ListResponse<R>>()

  const isRenderProps = typeof filterRender === 'function'

  const { refetch, data, isLoading } = useQuery<ListResponse<R>>({
    ...query(typeof requestFormatter === 'function' ? requestFormatter(filters) : filters),
    enabled: accessible,
  })

  const pagination = useMemo<PaginationProps>(() => {
    return {
      showSizeChanger: true,
      showQuickJumper: true,
      current: filters.page,
      pageSize: filters.size,
      total: response?.Total,
      onChange(currentPage, currentSize) {
        setFilters(prev => ({
          ...prev,
          page: currentPage,
          size: currentSize,
        }))
      },
    }
  }, [filters, response])

  const onSubmit = (values: F) => {
    setFilters(prev => ({
      ...prev,
      ...values,
    }))
  }

  useEffect(() => {
    if (game) {
      refetch().then()
    }
  }, [game, refetch])

  useEffect(() => {
    if (data) {
      setResponse(typeof responseFormatter === 'function' ? responseFormatter(data) : data)
    }
  }, [data, responseFormatter])

  if (isChecking) {
    return <Spin className="flex justify-center items-center h-64" />
  }

  if (!accessible) {
    return <NoPermissionCover />
  }

  const formRender = () => {
    if (filterRender) {
      return (
        <div className="mb-6">
          <Form
            className="max-w-0 p-6 rounded-md bg-gray-50"
            form={form}
            layout={formLayout}
            autoComplete="off"
            onFinish={onSubmit}
          >
            <Row gutter={18}>{isRenderProps ? filterRender(form) : filterRender}</Row>
            <Row justify="end">
              <Col>
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
      )
    }

    return null
  }

  return (
    <>
      {formRender()}
      <Table
        rowKey={rowKey}
        columns={columns}
        tableLayout={tableLayout}
        dataSource={response?.List}
        loading={isLoading}
        expandable={expandable}
        pagination={pagination}
      />
    </>
  )
}

export default QueryList
