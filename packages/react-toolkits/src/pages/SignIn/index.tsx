import { useToolkitsContext } from '@/components/ContextProvider'
import { SSO_URL } from '@/constants'
import { useTokenStore } from '@/stores/token'
import { useTranslation } from '@/utils/i18n'
import { request } from '@/utils/request'
import { AliyunOutlined } from '@ant-design/icons'
import { Alert, Button, Card, Col, Divider, Row, Space, Typography } from 'antd'
import type { FC, PropsWithChildren } from 'react'
import { Navigate, useLocation, useSearchParams } from 'react-router-dom'
import useSWRImmutable from 'swr/immutable'
import Default from './default'

const { Title } = Typography

const Login: FC<PropsWithChildren> = props => {
  const { children } = props
  const [searchParams] = useSearchParams()
  const location = useLocation()
  const { token, setToken } = useTokenStore()
  const t = useTranslation()
  const { localeDropdownMenu } = useToolkitsContext()

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
    return <Navigate replace to="/" />
  }

  return (
    <Row>
      {localeDropdownMenu && <div className="fixed top-8 right-8">{localeDropdownMenu}</div>}
      <Col span={10} offset={3}>
        <div className="h-screen flex justify-end items-center">
          <Default />
        </div>
      </Col>
      <Col span={5} offset={3}>
        <div className="h-screen relative">
          <Card hoverable className="absolute left-0 right-0 top-1/2 -translate-y-1/2">
            {location.state?.notUser && (
              <div className="absolute -top-12 left-0 right-0">
                <Alert banner closable message={t('Login.notRegistered')} type="error" />
              </div>
            )}
            <div className="text-center mb-6">
              <Title level={5}>{t('Login.title')}</Title>
              <div className="min-h-10">{children}</div>
            </div>
            <Divider plain>{t('Login.thirdParty')}</Divider>
            <div className="w-full flex justify-center">
              <Space size="small">
                <Button
                  type="link"
                  size="small"
                  shape="round"
                  icon={<AliyunOutlined />}
                  href={`${SSO_URL}/login?service=${encodeURIComponent(window.location.origin + '/sign_in')}`}
                  target="_self"
                >
                  {t('Login.loginWithIDass')}
                </Button>
              </Space>
            </div>
          </Card>
        </div>
      </Col>
    </Row>
  )
}

export default Login
