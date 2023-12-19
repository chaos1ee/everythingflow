# React Toolkits

## Installation

```bash
pnpm install react-toolkits
```

## Usage

```tsx 
import 'react-toolkits/style.css'
import { createRoot } from 'react-dom/client'
import { ReactToolkitsProvider } from 'react-toolkits'
import type { NavMenuItem } from "react-toolkits";

const container = document.getElementById('root') as HTMLElement
const root = createRoot(container)

const items: NavMenuItem[] = []

root.render(
  <ContextProvider title="React Web" menuItems={items}>
    <RouterProvider
      router={router}
      fallbackElement={
        <Spin
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            width: '100vw',
            height: '100vh',
          }}
        />
      }
    />
  </ContextProvider>,
)

```
