import ContextProvider from '@/components/ContextProvider'
import Layout from '@/components/Layout'
import { lazy } from 'react'
import type { RouteObject } from 'react-router-dom'
import { Navigate } from 'react-router-dom'

const OperationLogList = lazy(() => import('./OperationLogList'))

const routes: RouteObject[] = [
  {
    path: 'log',
    children: [
      {
        index: true,
        element: <Navigate relative="path" to="operation_log" />,
      },
      {
        path: 'operation_log',
        element: (
          <ContextProvider hideGameSelect>
            <Layout>
              <OperationLogList />
            </Layout>
          </ContextProvider>
        ),
      },
    ],
  },
]

export default routes
