import type { PermissionEnumItem } from '@/features/permission'
import { useTranslation } from '@/utils/i18n'
import { Checkbox, Col, Collapse, Row } from 'antd'
import type { CheckboxChangeEvent } from 'antd/es/checkbox'
import type { FC } from 'react'
import { useCallback, useEffect, useState } from 'react'

interface PermissionCollapseProps {
  expand?: boolean
  permissions?: PermissionEnumItem[]
  readonly?: boolean
  value?: string[]
  onChange?: (value: string[]) => void
}

const PermissionCollapse: FC<PermissionCollapseProps> = props => {
  const { permissions, readonly, expand, value, onChange } = props
  const [activeKey, setActiveKey] = useState<string[]>([])
  const [checkedMap, setCheckedMap] = useState<Record<string, boolean>>({})
  const [internalValue, setInternalValue] = useState<string[]>(value ?? [])
  const t = useTranslation()

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

  const onCheckChange = (e: CheckboxChangeEvent, codes: string[]) => {
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
    const checkedValue = (permissions ?? []).reduce(
      (acc, curr) => {
        acc[curr.category] = curr.permissions.every(item => internalValue?.includes(item.value))
        return acc
      },
      {} as Record<string, boolean>,
    )

    setCheckedMap(checkedValue)
  }, [internalValue, permissions])

  return (
    <Collapse
      style={{ width: '100%' }}
      collapsible="header"
      activeKey={activeKey}
      items={(permissions ?? []).map(item => ({
        key: item.category,
        label: item.category,
        extra: !readonly && (
          <Checkbox
            checked={checkedMap[item.category]}
            onChange={e => {
              onCheckChange(
                e,
                item.permissions.map(permission => permission.value),
              )
            }}
          >
            {t('selectAll')}
          </Checkbox>
        ),
        children: (
          <Checkbox.Group style={{ width: '100%' }} value={internalValue} disabled={readonly}>
            <Row gutter={[10, 10]} style={{ width: '100%' }}>
              {item.permissions.map(permission => (
                <Col key={permission.value} span={6}>
                  <Checkbox
                    value={permission.value}
                    onChange={e => {
                      onCheckChange(e, [permission.value])
                    }}
                  >
                    {permission.label}
                  </Checkbox>
                </Col>
              ))}
            </Row>
          </Checkbox.Group>
        ),
      }))}
      onChange={onCollapseChange}
    />
  )
}

export default PermissionCollapse
