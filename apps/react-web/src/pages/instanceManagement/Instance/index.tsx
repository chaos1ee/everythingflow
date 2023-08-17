import { Card, Dropdown, Form, Input, InputNumber, Select, Space, Tree, Typography } from 'antd'
import type { DataNode } from 'antd/es/tree'
import * as React from 'react'
import { useState } from 'react'
import { useFormModal } from 'react-toolkits'
import type { DatabaseType, InstanceTreeNode } from '~/features/instance'
import { useAddDirectory, useAddInstance, useTreeNodes } from '~/features/instance'
import { DatabaseOutlined, PlusOutlined } from '@ant-design/icons'

const { Text } = Typography
const { Option } = Select
const { DirectoryTree } = Tree

const useCreatingDirectoryModal = () => {
  const add = useAddDirectory()

  return useFormModal<{ name: string; parentId: string }>({
    title: '添加目录',
    layout: 'vertical',
    content: (
      <>
        <Form.Item hidden name="parentId">
          <Input />
        </Form.Item>
        <Form.Item label="目录名称" name="name" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
      </>
    ),
    async onConfirm({ name, parentId }) {
      await add.trigger({ name, parent: parentId })
    },
  })
}

const useCreatingInstanceModal = () => {
  const add = useAddInstance()
  return useFormModal<{
    parentId: string
    type: DatabaseType
    name: string
    host: string
    port: number
    username: string
    password: string
    dsn?: string
  }>({
    title: '添加实例',
    width: 600,
    content: (
      <>
        <Form.Item hidden name="parentId">
          <Input />
        </Form.Item>
        <Form.Item label="实例名称" name="name" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item label="数据库类型" name="dbType" rules={[{ required: true }]}>
          <Select>
            <Option value="mysql">MySQL</Option>
            <Option value="redis">Redis</Option>
          </Select>
        </Form.Item>
        <Form.Item label="Host" name="host" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item label="端口" name="port" rules={[{ required: true }, { type: 'integer' }]}>
          <InputNumber min={0} />
        </Form.Item>
        <Form.Item label="用户名" name="username1" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item label="密码" name="password" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item label="DSN" name="dsn">
          <Input />
        </Form.Item>
      </>
    ),
    async onConfirm({ parentId, type, ...restValues }) {
      await add.trigger({
        ...restValues,
        parent_path: parentId,
        db_type: type,
      })
    },
  })
}

const Instance = () => {
  const { showModal: showCreatingDirectoryModal, Modal: CreatingDirectoryModal } = useCreatingDirectoryModal()
  const { showModal: showCreatingInstanceModal, Modal: CreatingInstanceModal } = useCreatingInstanceModal()
  const [hoveredKey, setHoveredKey] = useState<React.Key>('')
  const { data: treeNodes, isLoading } = useTreeNodes()

  const getTreeData = (nodes: InstanceTreeNode[]): DataNode[] => {
    return nodes.map(node => {
      if (Array.isArray(node.children)) {
        return {
          title: node.name,
          key: node.id,
          isLeaf: false,
          children: getTreeData(node.children),
        }
      }

      return {
        title: node.name,
        key: node.id,
        isLeaf: true,
        icon: <DatabaseOutlined />,
      }
    })
  }

  const treeData = getTreeData(treeNodes?.children ?? [])

  const onMouseOver = (data: DataNode) => {
    if (hoveredKey !== data.key) {
      setHoveredKey(data.key)
    }
  }

  const renderTitle = (data: DataNode) => {
    if (data.isLeaf) {
      return (
        // eslint-disable-next-line jsx-a11y/mouse-events-have-key-events
        <span onMouseOverCapture={() => onMouseOver(data)}>
          {typeof data.title === 'function' ? data.title(data) : data.title}
        </span>
      )
    }

    return (
      <Space onMouseOver={() => onMouseOver(data)}>
        <Text ellipsis>{typeof data.title === 'function' ? data.title(data) : data.title}</Text>
        {hoveredKey === data.key && (
          <Dropdown
            trigger={['hover']}
            menu={{
              items: [
                {
                  label: '添加目录',
                  key: '1',
                  onClick() {
                    showCreatingDirectoryModal({
                      initialValues: {
                        parentId: data.key + '',
                      },
                    })
                  },
                },
                {
                  label: '添加实例',
                  key: '2',
                  onClick() {
                    showCreatingInstanceModal()
                  },
                },
              ],
            }}
          >
            <PlusOutlined onClick={e => e.preventDefault()} />
          </Dropdown>
        )}
      </Space>
    )
  }

  return (
    <>
      <Card title="实例" loading={isLoading}>
        <DirectoryTree
          blockNode
          showIcon
          titleRender={renderTitle}
          selectable={false}
          expandAction={false}
          treeData={treeData}
        />
      </Card>
      {CreatingDirectoryModal}
      {CreatingInstanceModal}
    </>
  )
}

export default Instance
