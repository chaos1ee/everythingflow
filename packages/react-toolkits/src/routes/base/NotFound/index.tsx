import { Button, Result } from 'antd'
import { useNavigate } from 'react-router-dom'

const NotFound = () => {
  const navigate = useNavigate()
  return (
    <div className="h-screen flex justify-center items-center">
      <Result
        status="404"
        title="404"
        subTitle="访问的页面不存在"
        extra={
          <Button
            type="primary"
            onClick={() => {
              navigate('/')
            }}
          >
            返回页面
          </Button>
        }
      />
    </div>
  )
}

export default NotFound
