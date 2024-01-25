import type Handsontable from 'handsontable'
import { AddedFlag, DeletedFlag, ModifiedFlag } from './constants'

export async function copyHtmlToClipboard(htmlString: string) {
  try {
    const blob = new Blob([htmlString], { type: 'text/html' })
    await navigator.clipboard.write([new ClipboardItem({ 'text/html': blob })])
    console.log('HTML string copied to clipboard')
  } catch (err) {
    console.error('Failed to copy: ', err)
  }
}

// 计算字符串出现次数
export function countString(str: string, target: string) {
  return str.split(new RegExp(target, 'gi')).length - 1
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function isEmpty(variable: any) {
  return variable === null || variable === '' || typeof variable === 'undefined'
}

// 改写 Handsontable 中的 instanceToHTML 函数
// 源代码可以参照 https://github.com/handsontable/handsontable/blob/d092d4aba25f85bbfdd161d50d40ada2f7e20dc5/handsontable/src/utils/parseTable.js#L27
export function toHTML(instance: Handsontable, isFirstRowFlag = false) {
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
