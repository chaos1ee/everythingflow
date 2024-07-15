import { Alert, Button, Divider, Form, Input, Space, Typography } from 'antd'
import { useEffect, type FC } from 'react'
import { Navigate, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import useSWRImmutable from 'swr/immutable'
import backgroundUrl from '../../assets/background.svg'
import logoUrl from '../../assets/logo.png'
import { useToolkitsContext } from '../../components/ContextProvider'
import { SSO_URL } from '../../constants'
import { useTranslation } from '../../hooks/i18n'
import { useTokenStore } from '../../stores/token'
import { request } from '../../utils/request'

const NotRegisteredFlag = 'notRegistered'

export const useRedirectToSignIn = () => {
  const clearToken = useTokenStore(state => state.clearToken)
  const navigate = useNavigate()
  const { signInUrl } = useToolkitsContext()

  return (notRegistered?: boolean) => {
    clearToken()
    navigate(signInUrl, { state: { [NotRegisteredFlag]: notRegistered } })
  }
}

interface RedirectToSignInProps {
  notRegistered?: boolean
}

export const RedirectToSignIn: FC<RedirectToSignInProps> = props => {
  const { notRegistered } = props
  const clearToken = useTokenStore(state => state.clearToken)
  const { signInUrl } = useToolkitsContext()

  useEffect(() => {
    return () => {
      clearToken()
    }
  }, [])

  return <Navigate relative="path" to={signInUrl} state={{ [NotRegisteredFlag]: notRegistered }} />
}

const SignIn: FC = () => {
  const [searchParams] = useSearchParams()
  const location = useLocation()
  const { token, setToken } = useTokenStore()
  const t = useTranslation()
  const { signInPageTitle, localeDropdownMenu, signInSuccessRedirectUrl, signInUrl } = useToolkitsContext()

  const idaasRedirectUrl = encodeURIComponent(window.location.origin + signInUrl)

  useSWRImmutable(
    searchParams.has('ticket') ? `/api/usystem/user/login?ticket=${searchParams.get('ticket')}` : null,
    url => request<{ token: string }>(url),
    {
      suspense: true,
      onSuccess: data => {
        setToken(data.data.token)
      },
    },
  )

  if (token) {
    if (signInSuccessRedirectUrl) {
      return <Navigate replace to={signInSuccessRedirectUrl} />
    }

    return <Navigate replace to="/" />
  }

  return (
    <div className="w-screen h-screen relative flex overflow-hidden">
      {localeDropdownMenu && <div className="absolute top-16 right-16 z-10">{localeDropdownMenu}</div>}
      <div className="absolute left-14 top-6">
        <Space align="center">
          <img src={logoUrl} className="w-12" alt="logo" />
          {signInPageTitle}
        </Space>
      </div>
      <div className="flex-1 flex justify-center items-center bg-slate-50">
        <img src={backgroundUrl} alt="background" className="w-10/12" />
      </div>
      <div className="w-[650px] relative top-0 left-0 right-0 bottom-0">
        <div className="absolute top-1/2 -translate-y-1/2 left-0 right-0">
          <div className="-translate-y-10 px-36">
            <div className="flex flex-col justify-center">
              <div className="h-10">
                {location.state?.[NotRegisteredFlag] && (
                  <Alert banner closable message={t('SignIn.notRegistered')} type="error" />
                )}
              </div>
              <Typography.Title level={2}>{t('SignIn.welcome')}</Typography.Title>
              <div className="mt-4">
                <Form layout="vertical" autoComplete="off">
                  <Form.Item label={t('global.username')} name="username" rules={[{ required: true }]}>
                    <Input />
                  </Form.Item>
                  <Form.Item label={t('global.password')} name="password" rules={[{ required: true }]}>
                    <Input.Password />
                  </Form.Item>
                  <Form.Item>
                    <Button block type="primary" shape="round" htmlType="submit">
                      {t('global.signIn')}
                    </Button>
                  </Form.Item>
                </Form>
              </div>
              <Divider plain dashed>
                {t('SignIn.thirdParty')}
              </Divider>
              <div className="flex justify-center items-center">
                <Button block shape="round" href={`${SSO_URL}/login?service=${idaasRedirectUrl}`} target="_self">
                  <img src={logoUrl} className="w-[18px]" alt="logo" />
                  {t('SignIn.signInWithIDass')}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SignIn
