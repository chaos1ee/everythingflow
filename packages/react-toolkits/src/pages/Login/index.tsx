import { SSO_URL } from '@/constants'
import { useTokenStore } from '@/stores'
import { AliyunOutlined } from '@ant-design/icons'
import { Alert, Button, Card, Col, Divider, Row, Space, Spin, Typography } from 'antd'
import type { FC, PropsWithChildren } from 'react'
import { useEffect, useState } from 'react'
import { Navigate, useSearchParams } from 'react-router-dom'
import useSWRImmutable from 'swr/immutable'
import Default from './default'

const { Title } = Typography

const Login: FC<PropsWithChildren> = props => {
  const { children } = props
  const [searchParams, setSearchParams] = useSearchParams()
  const token = useTokenStore(state => state.token)
  const setToken = useTokenStore(state => state.setToken)
  const [showAlert, setShowAlert] = useState(false)

  const { isLoading } = useSWRImmutable<{ token: string }>(
    searchParams.has('ticket')
      ? {
          url: '/api/usystem/user/login',
          params: {
            ticket: searchParams.get('ticket'),
          },
        }
      : null,
    {
      onSuccess: data => {
        setToken(data.token)
      },
    },
  )

  useEffect(() => {
    if (searchParams.has('not_registered')) {
      setShowAlert(true)
      searchParams.delete('not_registered')
      setSearchParams(searchParams)
    }
  }, [searchParams, setSearchParams])

  if (isLoading) {
    return (
      <Spin
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          width: '100vw',
          height: '100vh',
        }}
      />
    )
  }

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
            {showAlert && (
              <div className="absolute -top-12 left-0 right-0">
                <Alert
                  banner
                  closable
                  message="您还未在平台注册，请联系管理员"
                  type="error"
                  onClose={() => {
                    setShowAlert(false)
                  }}
                />
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
