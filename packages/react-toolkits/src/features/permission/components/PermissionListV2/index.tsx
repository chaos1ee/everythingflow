import { Button, Card, Divider, Empty, Select, Skeleton, Space, Typography } from 'antd'
import type { FC } from 'react'
import { useEffect, useState } from 'react'
import type { RoleV2 } from '../../types'
import { useAllPermissionsV2 } from '../../hooks'
import PermissionCollapse from '../PermissionCollapse'
import type { PermissionListPropsBase } from '../PermissionList'
import { useTranslation } from '@/utils/i18n'

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
  const globalPermissions = permissions?.permission?.filter(item => item.is_common)
  const gamePermissions = permissions?.permission?.filter(item => !item.is_common)
  const t = useTranslation()

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
        <Text type="danger">{t('PermissionList.failedDescription')}</Text>
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
        <Divider dashed>{t('PermissionList.baseSectionTitle')}</Divider>
      </div>
      <Skeleton active loading={isLoading}>
        <PermissionCollapse
          value={value?.global}
          readonly={readonly}
          permissions={globalPermissions}
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
        <Divider dashed>{t('PermissionList.gameSectionTitle')}</Divider>
      </div>
      {gameList.map((item, index) => (
        <Card
          title={
            <Space>
              <Text>{t('game')}</Text>
              {readonly ? (
                <Text>{permissions?.game?.find(game => game.id === item.gameId)?.name}</Text>
              ) : (
                <Select
                  disabled={readonly}
                  value={gameList[index].gameId || undefined}
                  style={{ width: '160px' }}
                  placeholder={t('PermissionList.gameSelectPlaceholder')}
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
                {t('PermissionList.removeText')}
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
                permissions={gamePermissions}
                onChange={newValue => {
                  onChange?.({
                    ...value,
                    [gameList[index].gameId]: newValue,
                  })
                }}
              />
            </Skeleton>
          ) : (
            <Empty description={t('PermissionList.gameSectionDescription')} />
          )}
        </Card>
      ))}
      {!readonly && (
        <Button block type="dashed" onClick={addGame}>
          {t('PermissionList.addText')}
        </Button>
      )}
    </div>
  )
}

export default PermissionListV2
