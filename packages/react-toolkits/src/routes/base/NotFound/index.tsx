import { Button, Result } from 'antd'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from '@/utils/i18n'

const NotFound = () => {
  const navigate = useNavigate()
  const t = useTranslation()
  return (
    <div className="h-screen flex justify-center items-center">
      <Result
        status="404"
        title="404"
        subTitle={t('NotFound.subTitle')}
        extra={
          <Button
            type="primary"
            onClick={() => {
              navigate('/')
            }}
          >
            {t('NotFound.buttonText')}
          </Button>
        }
      />
    </div>
  )
}

export default NotFound
