import { RouterProvider } from 'react-router-dom'
import Providers from './Providers'
import router from './router'

const App = () => {
  return (
    <Providers>
      <RouterProvider router={router} />
    </Providers>
  )
}

export default App
