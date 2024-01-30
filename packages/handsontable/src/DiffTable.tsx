import type HotTableClass from '@handsontable/react/hotTableClass'
import type Handsontable from 'handsontable'
import type { CellProperties } from 'handsontable/settings'
import { useRef, type FC } from 'react'
import type { TableProps } from './Table'
import Table from './Table'
import { AddedFlag, DeletedFlag, ModifiedFlag } from './constants'
import { isEmpty } from './utils'


interface DiffTableProps extends Pick<TableProps, 'loading'> {
  header?: string[][]
  body?: string[][]
}

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

const DiffTable: FC<DiffTableProps> = props => {
  const { header, body, loading } = props
  const hotRef = useRef<HotTableClass>(null)
  // 第一行为标记行
  const isFirstRowFlag = header?.[0]?.[0] === '!'
  const data = (header ?? []).concat(body ?? [])
  const fixedRowsTop = header?.length ?? 0

  const afterRenderer = (
    td: HTMLTableCellElement,
    row: number,
    column: number,
    _prop: string | number,
    value: string,
    cellProperties: CellProperties,
  ) => {
    cellProperties.className = cellProperties.className || ''

    const hot = hotRef.current?.hotInstance

    if (!hot) return

    const visualRowIndex = hot.toVisualRow(row)
    const visualColIndex = hot.toVisualColumn(column)
    const originalValue = value.toString() as string

    if (visualColIndex === 0) {
      cellProperties.className += ' htCenter'
    }

    if (visualColIndex === 0 && originalValue.includes(ModifiedFlag)) {
      cellProperties.className += ' modified'
    } else if (
      hot.getDataAtCell(visualRowIndex, 0).includes(DeletedFlag) ||
      (isFirstRowFlag && hot.getDataAtCell(0, visualColIndex).includes(DeletedFlag))
    ) {
      cellProperties.className += ' deleted'
    } else if (
      hot.getDataAtCell(visualRowIndex, 0).includes(AddedFlag) ||
      (isFirstRowFlag && hot.getDataAtCell(0, visualColIndex).includes(AddedFlag))
    ) {
      cellProperties.className += ' added'
    } else if (visualColIndex !== 0 && originalValue.includes(ModifiedFlag)) {
      td.innerHTML = originalValue.replace(new RegExp(`(.*)(${ModifiedFlag})(.*)`), (_, p1, p2, p3) => {
        return `<span style="background: rgba(255, 129, 130, 0.4);">${p1}</span>${p2}<span style="background: rgb(171, 242, 188)">${p3}</span>`
      })
    } else {
      td.innerHTML = originalValue
    }
  }

  return (
    <Table
      readOnly
      ref={hotRef}
      fixedRowsTop={fixedRowsTop}
      fixedColumnsLeft={1}
      loading={loading}
      data={data}
      afterRenderer={afterRenderer}
      toHTML={instance => toHTML(instance, isFirstRowFlag)}
    />
  )
}

export default DiffTable
