import { PlusOutlined } from '@ant-design/icons'
import { Button, Card, Form, Input, InputNumber, Select, Space, Tree, Typography } from 'antd'
import type { DataNode } from 'antd/es/tree'
import type { Key} from 'react';
import { useState } from 'react'
import { useFetcher, useFormModal } from 'react-toolkits'

const { Text, Link } = Typography
const { Option } = Select

const useCreatingGroupModal = () => {
  return useFormModal({
    title: '添加分组',
    layout: 'vertical',
    content: (
      <>
        <Form.Item label="分组名称" name="name" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
      </>
    ),
    async onConfirm() {
      await new Promise(resolve => setTimeout(resolve, 1000))
    },
  })
}

const useCreatingInstanceModal = () => {
  return useFormModal({
    title: '添加实例',
    width: 600,
    content: (
      <>
        <Form.Item label="实例名称" name="name" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item label="实例类型" name="type" rules={[{ required: true }]}>
          <Select>
            <Option value={1}>主库</Option>
            <Option value={2}>从库</Option>
          </Select>
        </Form.Item>
        <Form.Item label="数据库类型" name="dbType" rules={[{ required: true }]}>
          <Select>
            <Option value={1}>MySQL</Option>
            <Option value={2}>Redis</Option>
          </Select>
        </Form.Item>
        <Form.Item label="实例连接" name="dbType" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item label="端口" name="port" rules={[{ required: true }, { type: 'integer' }]}>
          <InputNumber min={0} />
        </Form.Item>
      </>
    ),
    async onConfirm() {
      await new Promise(resolve => setTimeout(resolve, 1000))
    },
  })
}

const Instance = () => {
  const fetcher = useFetcher()
  const { showModal: showCreatingGroupModal, Modal: CreatingGroupModal } = useCreatingGroupModal()
  const { showModal: showCreatingInstanceModal, Modal: CreatingInstanceModal } = useCreatingInstanceModal()
  const [hoveredKey, setHoveredKey] = useState<Key | null>(null)

  const initTreeData: DataNode[] = [
    { title: '分组 1', key: '0' },
    { title: '分组 2', key: '1' },
    { title: '分组 3', key: '2', isLeaf: true },
  ]

  const [treeData, setTreeData] = useState(initTreeData)

  const nodeClickHandler = (data: DataNode) => {
    showCreatingInstanceModal()
  }

  const onMouseOver = (data: DataNode) => {
    setHoveredKey(data.key)
  }

  const onMouseOut = () => {
    setHoveredKey(null)
  }

  const onBlur = () => {
    setHoveredKey(null)
  }

  const renderTitle = (data: DataNode) => {
    return (
      <Space onMouseOverCapture={() => onMouseOver(data)} onMouseOut={() => onMouseOut()} onBlur={() => onBlur()}>
        <Text ellipsis>{typeof data.title === 'function' ? data.title(data) : data.title}</Text>
        {data.key === hoveredKey && (
          <Button
            title="添加实例"
            size="small"
            type="text"
            icon={<PlusOutlined />}
            onClick={() => nodeClickHandler(data)}
          ></Button>
        )}
      </Space>
    )
  }

  const updateTreeData = (list: DataNode[], key: React.Key, children: DataNode[]): DataNode[] =>
    list.map(node => {
      if (node.key === key) {
        return {
          ...node,
          children,
        }
      }

      if (node.children) {
        return {
          ...node,
          children: updateTreeData(node.children, key, children),
        }
      }

      return node
    })

  const onLoadData = ({ key, children }: { key: React.Key; children?: DataNode[] }) => {
    if (children) {
      return Promise.resolve()
    }

    return fetcher<
      {
        title: string
        key: React.Key
      }[]
    >({
      method: 'GET',
      url: '/api/instance/list',
      params: {
        key,
      },
    }).then(res => {
      setTreeData(origin => updateTreeData(origin, key, res))
    })
  }

  return (
    <>
      <Card
        title="实例"
        extra={
          <Button
            onClick={() => {
              showCreatingGroupModal()
            }}
          >
            添加分组
          </Button>
        }
      >
        <Tree showIcon selectable={false} loadData={onLoadData} treeData={treeData} titleRender={renderTitle} />
      </Card>
      {CreatingGroupModal}
      {CreatingInstanceModal}
    </>
  )
}

export default Instance
