import { Card, Col, Form, Select } from 'antd'
import { useCallback, useEffect } from 'react'
import type { QueryListKey } from 'react-toolkits'
import { FilterForm } from 'react-toolkits'
import { useDatabases, useInstances } from '~/features/sql'

export const swrKey: QueryListKey = {
  method: 'GET',
  url: '/api/sql/query-online',
}

interface FormValues {
  instanceId: string
  database: string
  sql: string
}

const QueryOnline = () => {
  const [form] = Form.useForm<FormValues>()
  const instanceId = Form.useWatch('instanceId', form)
  const { data: instances } = useInstances()
  const { data: databases, isLoading } = useDatabases(instanceId)

  useEffect(() => {
    console.log(instanceId)
  }, [instanceId])

  const onQuery = useCallback(async (values: FormValues) => {
    // TODO: query
  }, [])

  return (
    <Card title="在线查询">
      <FilterForm<FormValues> form={form} labelCol={{ flex: '80px' }} onFinish={onQuery}>
        <Col span={24}>
          <Form.Item label="实例" name="instanceId" rules={[{ required: true }]}>
            <Select
              showSearch
              loading={isLoading}
              optionFilterProp="label"
              options={instances?.map(item => ({ label: item.name, value: item.id }))}
            />
          </Form.Item>
        </Col>
        <Col span={24}>
          <Form.Item label="数据库" name="database" rules={[{ required: true }]}>
            <Select
              showSearch
              loading={isLoading}
              optionFilterProp="label"
              options={databases?.map(item => ({ label: item.name, value: item.id }))}
            />
          </Form.Item>
        </Col>
      </FilterForm>
      {/* <QueryList */}
      {/*   bordered */}
      {/*   columns={columns} */}
      {/*   swrKey={swrKey} */}
      {/*   labelCol={{ flex: '80px' }} */}
      {/*   confirmText="执行" */}
      {/*   renderForm={() => ( */}
      {/*     <> */}
      {/*       <Col span={24}> */}
      {/*         <Form.Item label="实例" name="instance" rules={[{ required: true }]}> */}
      {/*           <TreeSelect */}
      {/*             treeDataSimpleMode */}
      {/*             showSearch */}
      {/*             treeData={treeData} */}
      {/*             dropdownStyle={{ maxHeight: 400, overflow: 'auto' }} */}
      {/*             loadData={onLoadData} */}
      {/*             onChange={value => console.log(value)} */}
      {/*           /> */}
      {/*         </Form.Item> */}
      {/*       </Col> */}
      {/*       <Col span={24}> */}
      {/*         <Form.Item label="数据库" name="database" rules={[{ required: true }]}> */}
      {/*           <Select */}
      {/*             showSearch */}
      {/*             optionFilterProp="label" */}
      {/*             options={[ */}
      {/*               { label: 'db1', value: 1 }, */}
      {/*               { label: 'db2', value: 2 }, */}
      {/*             ]} */}
      {/*           /> */}
      {/*         </Form.Item> */}
      {/*       </Col> */}
      {/*       <Col span={24}> */}
      {/*         <Form.Item label="SQL" name="sql" rules={[{ required: true }]}> */}
      {/*           <Editor height="200px" defaultLanguage="sql" options={{ minimap: { enabled: false } }} /> */}
      {/*         </Form.Item> */}
      {/*       </Col> */}
      {/*     </> */}
      {/*   )} */}
      {/* /> */}
    </Card>
  )
}

export default QueryOnline
