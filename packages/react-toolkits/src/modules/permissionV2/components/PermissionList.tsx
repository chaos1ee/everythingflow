import { Button, Card, Checkbox, Col, Collapse, Divider, Empty, Row, Select, Skeleton, Space, Typography } from 'antd'
import type { CheckboxChangeEvent } from 'antd/es/checkbox'
import type { FC } from 'react'
import { useCallback, useEffect, useState } from 'react'
import { useAllPermissions } from '../hooks'
import type { PermissionEnumItem } from '../types'

const { Panel } = Collapse
const { Text } = Typography
const { Option } = Select

const PermissionCollapse: FC<PermissionListProps> = props => {
  const { permissions, readonly, expand, value, onChange } = props
  const [activeKey, setActiveKey] = useState<string[]>([])
  const [checkedMap, setCheckedMap] = useState<Record<string, boolean>>({})
  const [internalValue, setInternalValue] = useState<string[]>(value ?? [])

  const onCollapseChange = useCallback((key: string | string[]) => {
    setActiveKey(key as string[])
  }, [])

  const getCheckedValue = (checkedValue: boolean, codes: string[]) => {
    let tempValue: string[] = []

    if (checkedValue) {
      tempValue = [...new Set(internalValue.concat(codes))]
    } else {
      tempValue = internalValue.slice()

      codes.forEach(code => {
        const index = tempValue.findIndex(item => item === code)
        if (index > -1) {
          tempValue.splice(index, 1)
        }
      })
    }

    return tempValue
  }

  const onCheckChange = (e: CheckboxChangeEvent, category: string, codes: string[]) => {
    const checkedValue = getCheckedValue(e.target.checked, codes)
    setInternalValue(checkedValue)
    onChange?.(checkedValue)
  }

  useEffect(() => {
    setInternalValue(value ?? [])
  }, [value])

  useEffect(() => {
    if (expand) {
      setActiveKey((permissions ?? []).map(({ category }) => category))
    }
  }, [expand, permissions])

  useEffect(() => {
    const checkedValue = (permissions ?? []).reduce((acc, curr) => {
      acc[curr.category] = curr.permissions.every(item => internalValue.includes(item.value))
      return acc
    }, {} as Record<string, boolean>)

    setCheckedMap(checkedValue)
  }, [internalValue, permissions])

  return (
    <Collapse style={{ width: '100%' }} collapsible="header" activeKey={activeKey} onChange={onCollapseChange}>
      {(permissions ?? []).map(item => (
        <Panel
          header={item.category}
          key={item.category}
          extra={
            !readonly && (
              <Checkbox
                checked={checkedMap[item.category]}
                onChange={e => {
                  onCheckChange(
                    e,
                    item.category,
                    item.permissions.map(permission => permission.value),
                  )
                }}
              >
                全选
              </Checkbox>
            )
          }
        >
          <Checkbox.Group style={{ width: '100%' }} value={internalValue}>
            <Row gutter={[10, 10]} style={{ width: '100%' }}>
              {item.permissions.map(permission => (
                <Col key={permission.value} span={6}>
                  <Checkbox
                    disabled={readonly}
                    value={permission.value}
                    onChange={e => {
                      onCheckChange(e, item.category, [permission.value])
                    }}
                  >
                    {permission.label}
                  </Checkbox>
                </Col>
              ))}
            </Row>
          </Checkbox.Group>
        </Panel>
      ))}
    </Collapse>
  )
}

interface PermissionListProps {
  expand?: boolean
  permissions?: PermissionEnumItem[]
  readonly?: boolean
  value?: string[]
  onChange?: (value: string[]) => void
}

const PermissionList = ({
  expand = true,
  value,
  readonly,
  onChange,
}: {
  expand?: boolean
  value?: Record<string, string[]>
  readonly?: boolean
  onChange?: (value: Record<string, string[]>) => void
}) => {
  const { permissions, isLoading, isError } = useAllPermissions()
  const [gameList, setGameList] = useState<{ gameId: string; permissions: string[] }[]>([])

  useEffect(() => {
    const list: { gameId: string; permissions: string[] }[] = []

    Object.keys(value ?? {}).forEach(key => {
      if (key !== 'global') {
        list.push({ gameId: key, permissions: value?.[key] ?? [] })
      }
    })

    setGameList(list)
  }, [value])

  if (isError) {
    return (
      <div className="flex justify-center">
        <Text type="danger">获取权限失败</Text>
      </div>
    )
  }

  const addGame = () => {
    setGameList(prev => [...prev, { gameId: '', permissions: [] }])
  }

  const removeGame = (index: number) => {
    setGameList(prev => prev.filter((_, i) => i !== index))
  }

  return (
    <div className="flex flex-col w-full">
      <div className="mb-12">
        <Divider dashed>平台基础权限</Divider>
      </div>
      <Skeleton active loading={isLoading}>
        <PermissionCollapse
          value={value?.global}
          readonly={readonly}
          permissions={permissions?.permission?.slice(0, 2)}
          expand={expand}
          onChange={newValue => {
            onChange?.({
              ...value,
              global: newValue,
            })
          }}
        />
      </Skeleton>
      <div className="my-12">
        <Divider dashed>游戏权限</Divider>
      </div>
      {gameList.map((item, index) => (
        <Card
          title={
            <Space>
              <Text>游戏</Text>
              {readonly ? (
                <Text>{permissions?.game?.find(game => game.id === item.gameId)?.name}</Text>
              ) : (
                <Select
                  disabled={readonly}
                  value={gameList[index].gameId || undefined}
                  style={{ width: '160px' }}
                  placeholder="请选择游戏"
                  onChange={selectedValue => {
                    setGameList(pev => {
                      const temp = pev.slice()
                      temp[index].gameId = selectedValue
                      return temp
                    })
                  }}
                >
                  {permissions?.game?.map(game => (
                    <Option key={game.id} value={game.id} disabled={gameList.some(({ gameId }) => gameId === game.id)}>
                      {game.name}
                    </Option>
                  ))}
                </Select>
              )}
            </Space>
          }
          key={index}
          className="mb-6"
          extra={
            !readonly && (
              <Button
                type="link"
                onClick={() => {
                  removeGame(index)
                }}
              >
                移除
              </Button>
            )
          }
        >
          {gameList[index].gameId ? (
            <Skeleton active loading={isLoading}>
              <PermissionCollapse
                value={value?.[gameList[index].gameId]}
                readonly={readonly}
                expand={expand}
                permissions={permissions?.permission?.slice(2)}
                onChange={newValue => {
                  onChange?.({
                    ...value,
                    [gameList[index].gameId]: newValue,
                  })
                }}
              />
            </Skeleton>
          ) : (
            <Empty description="请先选择游戏" />
          )}
        </Card>
      ))}
      {!readonly && (
        <Button block type="dashed" onClick={addGame}>
          添加游戏权限
        </Button>
      )}
    </div>
  )
}

export default PermissionList
