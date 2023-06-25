import { AliyunOutlined } from '@ant-design/icons'
import { Alert, Button, Card, Col, Divider, Row, Space, Spin, Typography } from 'antd'
import type { FC } from 'react'
import { useEffect, useState } from 'react'
import { Navigate, useSearchParams } from 'react-router-dom'

import loginBg from '../assets/login.svg'
import { useGlobalHttpClient } from '../hooks'
import { useTokenStore } from '../stores'

const { Title } = Typography

const SSO_URL = 'https://idaas.ifunplus.cn/enduser/api/application/plugin_FunPlus/sso/v1'

const Login: FC = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const httpClient = useGlobalHttpClient()
  const token = useTokenStore(state => state.token)
  const setToken = useTokenStore(state => state.setToken)
  const [showAlert, setShowAlert] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (searchParams.has('ticket')) {
      httpClient
        .get<{ token: string }>('/usystem/user/login', {
          params: { ticket: searchParams.get('ticket') },
        })
        .then(res => {
          setToken(res.token)
        })
        .finally(() => {
          setIsLoading(false)
        })
    } else if (searchParams.has('not_registered')) {
      setIsLoading(false)
      setShowAlert(true)
    }
    setSearchParams()
  }, [searchParams, httpClient, setToken, setSearchParams])

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
          <img className="w-full -mt-28" src={loginBg} alt="login_bg" />
        </div>
      </Col>
      <Col span={5} offset={3}>
        <div className="h-screen relative flex">
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
              <div className="h-10"></div>
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
