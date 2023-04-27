import { Empty } from 'antd'
import warningSvg from '../../assets/warning.svg'

const NoPermissionCover = () => {
  return <Empty description="未授权，请联系管理员进行授权" image={warningSvg} imageStyle={{ height: 50 }} />
}

export default NoPermissionCover
