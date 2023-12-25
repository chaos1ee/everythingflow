import type { SelectProps } from 'antd'
import { Empty, Select } from 'antd'
import type { FC, ReactElement } from 'react'
import { useTranslation } from 'react-i18next'
import { useGlobalConfig } from '@/hooks'

export interface ProjectSelectProps {
  value?: SelectProps<number>['value']
  onChange?: SelectProps<number>['onChange']
}

const ProjectSelect: FC<ProjectSelectProps> = props => {
  const { value, onChange } = props
  const { t } = useTranslation()
  const { data, isLoading, accessible } = useGlobalConfig()

  function dropdownRender(menu: ReactElement) {
    if (!accessible) {
      return <Empty imageStyle={{ height: 30 }} description={t('not_authorized_msg_short')} />
    }
    return <>{menu}</>
  }

  return (
    <Select
      dropdownRender={dropdownRender}
      loading={isLoading}
      value={value}
      options={(data?.project ?? []).map(({ project_name, project_id }) => ({
        label: project_name,
        value: project_id,
      }))}
      onChange={onChange}
    />
  )
}

export default ProjectSelect
