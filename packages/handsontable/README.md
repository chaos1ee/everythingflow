# React Toolkits

## Installation

```bash
pnpm install @flow97/handsontable
```

## Usage

```tsx
import '@flow97/handsontable/style.css'
import Table from '@flow97/handsontable'

const App = () => {
  const data: string[][] =[]

  return <>
    <Table data={data} />
  </Table>
}
```
