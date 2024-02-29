import { Button, Result } from 'antd'
import { useNavigate } from 'react-router-dom'
import { useToolkitsContext } from '../../components/ContextProvider'
import { useTranslation } from '../../hooks/i18n'

const NotFound = () => {
  const navigate = useNavigate()
  const t = useTranslation()
  const { notFoundRedirectUrl } = useToolkitsContext()

  return (
    <div className="h-screen flex justify-center items-center">
      <Result
        status="404"
        title="404"
        subTitle={t('NotFound.subTitle')}
        extra={
          notFoundRedirectUrl && (
            <Button
              type="primary"
              onClick={() => {
                navigate(notFoundRedirectUrl)
              }}
            >
              {t('NotFound.buttonText')}
            </Button>
          )
        }
      />
    </div>
  )
}

export default NotFound
