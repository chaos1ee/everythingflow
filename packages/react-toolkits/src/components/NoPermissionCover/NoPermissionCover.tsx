import { Empty } from 'antd'
import { useTranslation } from 'react-i18next'
import warningSvg from '../../assets/warning.svg'

const NoPermissionCover = () => {
  const { t } = useTranslation()
  return <Empty description={t('not_authorized_msg')} image={warningSvg} imageStyle={{ height: 50 }} />
}

export default NoPermissionCover
