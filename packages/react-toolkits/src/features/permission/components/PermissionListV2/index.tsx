import { Button, Card, Divider, Empty, Select, Skeleton, Space, Typography } from 'antd'
import type { FC } from 'react'
import { useEffect, useState } from 'react'
import type { RoleV2 } from '../../types'
import { useAllPermissionsV2 } from '../../hooks'
import PermissionCollapse from '../PermissionCollapse'
import type { PermissionListPropsBase } from '../PermissionList'

const { Text } = Typography
const { Option } = Select

interface PermissionListV2Props extends PermissionListPropsBase {
  value?: RoleV2['permissions']
  onChange?: (checkedValue: RoleV2['permissions']) => void
}

const PermissionListV2: FC<PermissionListV2Props> = props => {
  const { expand = true, value, readonly, onChange } = props
  const { data: permissions, isLoading, error } = useAllPermissionsV2()
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

  if (error) {
    return (
      <div className="flex justify-center">
        <Text type="danger">权限获取失败</Text>
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

export default PermissionListV2
