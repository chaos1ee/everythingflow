import { HotTableClass } from '@handsontable/react'
import { BaseRenderer, textRenderer } from 'handsontable/renderers'
import { useRef, type FC } from 'react'
import type { TableProps } from './Table'
import Table from './Table'
import { AdditionMark, EditingMark, RemovalMark } from './constants'
import { toDiffHTML } from './utils'

export interface DiffTableProps
  extends Omit<TableProps, 'data' | 'cells' | 'fixedRowsTop' | 'fixedColumnsLeft' | 'toHTML'> {
  header?: string[][]
  body?: string[][]
}

const DiffTable: FC<DiffTableProps> = props => {
  const { header, body, ...restProps } = props
  const hotRef = useRef<HotTableClass>(null)
  // 第一行为特殊标记行
  const isFirstRowSpecial = header?.[0]?.[0] === '!'
  const data = (header ?? []).concat(body ?? [])
  const fixedRowsTop = header?.length ?? 0

  const cellRenderer: BaseRenderer = (instance, td, row, column, prop, value: string, cellProperties) => {
    textRenderer(instance, td, row, column, prop, value, cellProperties)

    if (column === 0) {
      td.classList.add('htCenter')
    }

    if (column === 0 && value.includes(EditingMark)) {
      td.classList.add('editing')
    } else if (data[row][0].includes(RemovalMark) || (isFirstRowSpecial && data[0][column].includes(RemovalMark))) {
      td.classList.add('removal')
    } else if (data[row][0].includes(AdditionMark) || (isFirstRowSpecial && data[0][column].includes(AdditionMark))) {
      td.classList.add('addition')
    } else if (column !== 0 && value.includes(EditingMark)) {
      td.innerHTML = (value.toString() as string).replace(new RegExp(`(.*)(${EditingMark})(.*)`), (_, p1, p2, p3) => {
        return `<span style="background: rgba(255, 129, 130, 0.4);">${p1}</span>${p2}<span style="background: rgb(171, 242, 188)">${p3}</span>`
      })
    }
  }

  const cells = () => {
    return {
      renderer: cellRenderer,
    }
  }

  return (
    <Table
      {...restProps}
      ref={hotRef}
      fixedRowsTop={fixedRowsTop}
      fixedColumnsLeft={1}
      data={data}
      toHTML={instance => toDiffHTML(instance, isFirstRowSpecial)}
      cells={cells}
    />
  )
}

export default DiffTable
