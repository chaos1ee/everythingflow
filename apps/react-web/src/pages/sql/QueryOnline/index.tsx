import Editor from '@monaco-editor/react'
import type { TreeSelectProps } from 'antd'
import { Card, Col, Form, Select, TreeSelect } from 'antd'
import type { DefaultOptionType } from 'antd/es/select'
import type { ColumnsType } from 'antd/es/table'
import { useState } from 'react'
import type { QueryListKey } from 'react-toolkits'
import { QueryList } from 'react-toolkits'
import type { QueryResponseListItem } from '~/features/sql'

export const swrKey: QueryListKey = {
  method: 'GET',
  url: '/sql/query-online',
}

const QueryOnline = () => {
  const [treeData, setTreeData] = useState<Omit<DefaultOptionType, 'label'>[]>([
    { id: 1, pId: 0, value: '1', title: 'Expand to load' },
    { id: 2, pId: 0, value: '2', title: 'Expand to load' },
    { id: 3, pId: 0, value: '3', title: 'Tree Node', isLeaf: true },
  ])

  const genTreeNode = (parentId: number, isLeaf = false) => {
    const random = Math.random().toString(36).substring(2, 6)
    return {
      id: random,
      pId: parentId,
      value: random,
      title: isLeaf ? 'Tree Node' : 'Expand to load',
      isLeaf,
    }
  }

  const onLoadData: TreeSelectProps['loadData'] = ({ id }) =>
    new Promise(resolve => {
      setTimeout(() => {
        setTreeData(treeData.concat([genTreeNode(id, false), genTreeNode(id, true), genTreeNode(id, true)]))
        resolve(undefined)
      }, 300)
    })

  const columns: ColumnsType<QueryResponseListItem> = [
    {
      key: 'user',
      title: '用户',
      dataIndex: 'user',
    },
    {
      key: 'database',
      title: '数据库',
      dataIndex: 'database',
    },
    {
      key: 'sql',
      title: 'SQL 语句',
      dataIndex: 'sql',
    },
  ]

  return (
    <Card title="在线查询">
      <QueryList
        bordered
        columns={columns}
        swrKey={swrKey}
        labelCol={{ flex: '80px' }}
        confirmText="执行"
        renderForm={() => (
          <>
            <Col span={24}>
              <Form.Item label="实例" name="instance" rules={[{ required: true }]}>
                <TreeSelect
                  treeDataSimpleMode
                  showSearch
                  treeData={treeData}
                  dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
                  loadData={onLoadData}
                  onChange={value => console.log(value)}
                />
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item label="数据库" name="database" rules={[{ required: true }]}>
                <Select
                  showSearch
                  optionFilterProp="label"
                  options={[
                    { label: 'db1', value: 1 },
                    { label: 'db2', value: 2 },
                  ]}
                />
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item label="SQL" name="sql" rules={[{ required: true }]}>
                <Editor height="200px" defaultLanguage="sql" options={{ minimap: { enabled: false } }} />
              </Form.Item>
            </Col>
          </>
        )}
      />
    </Card>
  )
}

export default QueryOnline
