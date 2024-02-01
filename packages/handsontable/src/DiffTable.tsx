import type HotTableClass from '@handsontable/react/hotTableClass'
import type Handsontable from 'handsontable'
import { BaseRenderer } from 'handsontable/renderers'
import { CellProperties } from 'handsontable/settings'
import { useRef, type FC } from 'react'
import type { TableProps } from './Table'
import Table from './Table'
import { AddedFlag, DeletedFlag, ModifiedFlag } from './constants'
import { isEmpty } from './utils'

// 改写 Handsontable 中的 instanceToHTML 函数
// 源代码可以参照 https://github.com/handsontable/handsontable/blob/d092d4aba25f85bbfdd161d50d40ada2f7e20dc5/handsontable/src/utils/parseTable.js#L27
function toHTML(instance: Handsontable, isFirstRowFlag = false) {
  const coords = [0, 0, instance.countRows() - 1, instance.countCols() - 1]
  const data = instance.getData(...coords)
  const countRows = data.length
  const countCols = countRows > 0 ? data[0].length : 0
  const TABLE = ['<table>', '</table>']
  const TBODY = ['<tbody>', '</tbody>']

  for (let row = 0; row < countRows; row += 1) {
    const CELLS = []

    for (let column = 0; column < countCols; column += 1) {
      let cell = ''

      const cellData = data[row][column]
      const { hidden, rowspan, colspan } = instance.getCellMeta(row, column)

      if (!hidden) {
        const attrs = []

        if (rowspan) {
          attrs.push(`rowspan="${rowspan}"`)
        }
        if (colspan) {
          attrs.push(`colspan="${colspan}"`)
        }

        let styles = ''

        if (column === 0) {
          styles += 'text-align: center;'
        }

        if (cellData.includes(ModifiedFlag)) {
          styles += 'background-color: #ddf4ff;'
        } else if (
          data[row][0].toString()?.includes(AddedFlag) ||
          (isFirstRowFlag && data[0][column].toString().includes(AddedFlag))
        ) {
          styles += 'background-color: #e6ffec;'
        } else if (
          data[row][0].toString().includes(DeletedFlag) ||
          (isFirstRowFlag && data[0][column].toString().includes(DeletedFlag))
        ) {
          styles += 'background-color: #ffebe9;'
        }

        if (styles !== '') {
          attrs.push(`style="${styles}"`)
        }

        if (isEmpty(cellData)) {
          cell = `<td ${attrs.join(' ')}></td>`
        } else {
          const value = cellData
            .toString()
            .replace('<', '&lt;')
            .replace('>', '&gt;')
            .replace(/(<br(\s*|\/)>(\r\n|\n)?|\r\n|\n)/g, '<br>\r\n')
            .replace(/\x20/gi, '&nbsp;')
            .replace(/\t/gi, '&#9;')

          cell = `<td ${attrs.join(' ')}>${value}</td>`
        }
      }

      CELLS.push(cell)
    }

    const TR = ['<tr>', ...CELLS, '</tr>'].join('')

    TBODY.splice(-1, 0, TR)
  }

  TABLE.splice(1, 0, TBODY.join(''))

  return TABLE.join('')
}

const modifiedCellRenderer: BaseRenderer = (_instance, td, _row, _column, _prop, value, _cellProperties) => {
  td.innerHTML = (value.toString() as string).replace(new RegExp(`(.*)(${ModifiedFlag})(.*)`), (_, p1, p2, p3) => {
    return `<span style="background: rgba(255, 129, 130, 0.4);">${p1}</span>${p2}<span style="background: rgb(171, 242, 188)">${p3}</span>`
  })
}

export interface DiffTableProps
  extends Omit<TableProps, 'data' | 'cells' | 'fixedRowsTop' | 'fixedColumnsLeft' | 'toHTML'> {
  header?: string[][]
  body?: string[][]
}

const DiffTable: FC<DiffTableProps> = props => {
  const { header, body, ...restProps } = props
  const hotRef = useRef<HotTableClass>(null)
  // 第一行为标记行
  const isFirstRowFlag = header?.[0]?.[0] === '!'
  const data = (header ?? []).concat(body ?? [])
  const fixedRowsTop = header?.length ?? 0

  const cells = (row: number, column: number) => {
    const cellProperties: Partial<CellProperties> = {}

    const hot = hotRef.current?.hotInstance
    if (!hot) return cellProperties

    const visualRowIndex = hot.toVisualRow(row)
    const visualColIndex = hot.toVisualColumn(column)
    const originalValue = hot.getDataAtCell(visualRowIndex, visualColIndex)
    const value = originalValue.toString() as string

    const classNames = []

    if (visualColIndex === 0) {
      classNames.push('htCenter')
    }

    if (visualColIndex === 0 && value.includes(ModifiedFlag)) {
      classNames.push('modified')
    } else if (
      hot.getDataAtCell(visualRowIndex, 0).includes(DeletedFlag) ||
      (isFirstRowFlag && hot.getDataAtCell(0, visualColIndex).includes(DeletedFlag))
    ) {
      classNames.push('deleted')
    } else if (
      hot.getDataAtCell(visualRowIndex, 0).includes(AddedFlag) ||
      (isFirstRowFlag && hot.getDataAtCell(0, visualColIndex).includes(AddedFlag))
    ) {
      classNames.push('added')
    } else if (visualColIndex !== 0 && value.includes(ModifiedFlag)) {
      cellProperties.renderer = modifiedCellRenderer
    }

    cellProperties.className = classNames.join(' ')

    return cellProperties
  }

  return (
    <Table
      {...restProps}
      ref={hotRef}
      fixedRowsTop={fixedRowsTop}
      fixedColumnsLeft={1}
      data={data}
      toHTML={instance => toHTML(instance, isFirstRowFlag)}
      cells={cells}
    />
  )
}

export default DiffTable
