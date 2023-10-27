import { useVersions } from '@/features/common'
import { Select } from 'antd'
import type { FC } from 'react'

interface VersionSelectProps {
  exclude?: number[]
  value?: number
  onChange?: (value: number) => void
}

const VersionSelect: FC<VersionSelectProps> = props => {
  const { exclude, ...restProps } = props
  const { data, isLoading } = useVersions()
  return (
    <Select
      {...restProps}
      className="w-full"
      loading={isLoading}
      options={(data?.list ?? [])
        .filter(item => !exclude?.includes(item.id))
        .map(item => ({
          label: item.name,
          value: item.id,
        }))}
    />
  )
}

export default VersionSelect
