import { SSO_URL } from '@/constants'
import { useTokenStore } from '@/stores'
import { AliyunOutlined } from '@ant-design/icons'
import { Alert, Button, Card, Col, Divider, Row, Space, Typography } from 'antd'
import type { FC, PropsWithChildren } from 'react'
import { Navigate, useLocation, useSearchParams } from 'react-router-dom'
import useSWRImmutable from 'swr/immutable'
import Default from './default'
import { request } from '@/utils'

const { Title } = Typography

const Login: FC<PropsWithChildren> = props => {
  const { children } = props
  const [searchParams, setSearchParams] = useSearchParams()
  const location = useLocation()
  const { token, setToken } = useTokenStore()

  useSWRImmutable<{ token: string }>(
    searchParams.has('ticket') ? `/api/usystem/user/login?ticket=${searchParams.get('ticket')}` : null,
    url => request(url),
    {
      suspense: true,
      onSuccess: data => {
        setToken(data.token)
      },
    },
  )

  if (token) {
    return <Navigate replace to="/" />
  }

  return (
    <Row>
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
                <Alert banner closable message="您还未在平台注册，请联系管理员" type="error" />
              </div>
            )}
            <div className="text-center mb-6">
              <Title level={5}>登录方式</Title>
              <div className="min-h-10">{children}</div>
            </div>
            <Divider plain>第三方登录方式</Divider>
            <div className="w-full flex justify-center">
              <Space size="small">
                <Button
                  type="link"
                  size="small"
                  shape="round"
                  icon={<AliyunOutlined />}
                  href={`${SSO_URL}/login?service=${encodeURIComponent(window.location.origin)}/login`}
                  target="_self"
                >
                  IDass 登录
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
