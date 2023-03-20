import { NoPermissionCover } from '..'
import { SearchOutlined } from '@ant-design/icons'
import { useQuery } from '@tanstack/react-query'
import type { FormInstance, FormProps } from 'antd'
import { Button, Col, Form, Row, Spin, theme, Table } from 'antd'
import type { TableProps } from 'antd/es/table'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { Merge } from 'ts-essentials'
import { usePermission } from '../../hooks'

type RenderChildren<T> = (form: FormInstance<T>) => JSX.Element

export interface QueryListPaginationParams {
  page: number
  size: number
}

export interface QueryListResponse {
  page: number
  size: number
}

export interface QueryListProps<R, F, P = F>
  extends Pick<TableProps<R>, 'rowKey' | 'columns' | 'expandable'>,
    Pick<FormProps, 'initialValues'> {
  // @lukemorales/query-key-factory 的类型定义太模糊了，后续完善
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  query: any
  // 权限编码
  code?: string
  filterRender?: RenderChildren<F> | JSX.Element
  totalProp?: string
  listProp?: string
  formLayout?: FormProps['layout']
  tableLayout?: TableProps<R>['tableLayout']
  // 参考 @tanstack/react-query useQuery 的 enabled 配置
  enabled?: (values: Merge<P, QueryListPaginationParams>) => boolean
  paramsTransformer?: (values: F) => P
}

const QueryList = <R extends object, F extends object, P extends object = F>(props: QueryListProps<R, F, P>) => {
  const {
    code,
    query,
    initialValues,
    rowKey,
    columns,
    filterRender,
    totalProp,
    listProp,
    formLayout,
    tableLayout,
    expandable,
    enabled,
    paramsTransformer,
  } = props
  const { token } = theme.useToken()
  const [form] = Form.useForm<F>()
  const { t } = useTranslation()
  const { data: viewable, isLoading: isChecking } = usePermission(code)

  const isRenderProps = typeof filterRender === 'function'

  const [filters, setFilters] = useState({
    page: 1,
    size: 10,
  } as Merge<P, QueryListPaginationParams>)

  const formStyle = {
    maxWidth: 'none',
    background: token.colorFillAlter,
    borderRadius: token.borderRadiusLG,
    padding: 24,
  }

  const { data, isLoading } = useQuery<any>({
    ...query(filters),
    enabled: viewable && (!enabled || enabled(filters)),
  })

  if (isChecking) {
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

  if (!viewable) {
    return <NoPermissionCover />
  }

  return (
    <div>
      {filterRender && (
        <div className={'mb-6'}>
          <Form
            style={formStyle}
            form={form}
            layout={formLayout}
            autoComplete="off"
            initialValues={initialValues}
            onFinish={values => {
              const newValues = typeof paramsTransformer === 'function' ? paramsTransformer(values) : values
              setFilters(prev => ({
                ...prev,
                ...newValues,
              }))
            }}
          >
            <Row gutter={18}>{isRenderProps ? filterRender(form) : filterRender}</Row>
            <Row>
              <Col span={24} style={{ textAlign: 'right' }}>
                <Button type="primary" htmlType="submit" icon={<SearchOutlined />}>
                  {t('search')}
                </Button>
                <Button className="ml-2" htmlType="reset">
                  {t('reset')}
                </Button>
              </Col>
            </Row>
          </Form>
        </div>
      )}
      <Table
        rowKey={rowKey}
        columns={columns}
        tableLayout={tableLayout}
        dataSource={data?.[listProp || 'List']}
        loading={isLoading}
        expandable={expandable}
        pagination={{
          showSizeChanger: true,
          showQuickJumper: true,
          current: filters.page,
          pageSize: filters.size,
          total: data?.[totalProp || 'Total'],
          onChange(currentPage, currentSize) {
            setFilters(prev => ({
              ...prev,
              page: currentPage,
              size: currentSize,
            }))
          },
        }}
      />
    </div>
  )
}

QueryList.defaultProps = {
  listProp: 'List',
  totalProp: 'Total',
}

export default QueryList
