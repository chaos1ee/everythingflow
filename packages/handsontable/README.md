# React Toolkits

## Installation

```bash
pnpm install @love1t/handsontable
```

## Usage

```tsx
import '@love1t/handsontable/style.css'
import Table from '@love1t/handsontable'

const App = () => {
  const data: string[][] =[]

  return <>
    <Table data={data} />
  </Table>
}
```
