import { HotTable } from '@handsontable/react'
import { Empty, Skeleton, Space } from 'antd'
import Handsontable from 'handsontable'
import 'handsontable/dist/handsontable.full.min.css'
import { AutoColumnSize, Search, registerPlugin } from 'handsontable/plugins'
import type { BaseRenderer } from 'handsontable/renderers'
import type { CellProperties } from 'handsontable/settings'
import { escapeRegExp } from 'lodash-es'
import type { FC } from 'react'
import { useRef, useState } from 'react'
import CopyButton from './CopyButton'
import SearchInput from './SearchInput'
import { AddedFlag, DeletedFlag, ModifiedFlag } from './constants'
import { useHeight, useRowHeights } from './hooks'
import './style.css'
import { copyHtmlToClipboard, countString, isEmpty, toHTML } from './utils'

registerPlugin(AutoColumnSize)
registerPlugin(Search)

interface SearchResult {
  row: number
  column: number
  data: string
  // 目标字符串出现次数
  count: number
}

interface DiffTableProps {
  header?: string[][]
  body?: string[][]
  loading?: boolean
}

const DiffTable: FC<DiffTableProps> = props => {
  const { header, body, loading } = props
  // 第一行为标记行
  const isFirstRowFlag = header?.[0]?.[0] === '!'
  const data = (header ?? []).concat(body ?? [])
  const fixedRowsTop = header?.length ?? 0
  const rowHeights = useRowHeights(data)
  const colHeaders = true
  const height = useHeight(data, fixedRowsTop, colHeaders)

  const hotRef = useRef<HotTable>(null)
  const query = useRef<string>('')
  const activeIndex = useRef(0)
  const resultIndex = useRef(0)
  const queryResult = useRef<SearchResult[]>([])
  const [total, setTotal] = useState(0)

  const getResultIndex = () => {
    let startIndex = 0
    let endIndex = 0

    for (let i = 0; i < queryResult.current.length; i++) {
      endIndex = startIndex + queryResult.current[i].count

      // 当 activeIndex 落到当前结果集中时，返回当前结果集的索引
      if (activeIndex.current >= startIndex && activeIndex.current < endIndex) {
        return i
      }

      startIndex += queryResult.current[i].count
    }

    return 0
  }

  const jump = (index: number) => {
    activeIndex.current = index
    resultIndex.current = getResultIndex()
    const { row, column } = queryResult.current[resultIndex.current]
    const hot = hotRef.current?.hotInstance
    hot?.scrollViewportTo(row, column)
    hot?.render()
  }

  const cellRenderer: BaseRenderer = (...args) => {
    const [instance, td, row, column, _prop, value] = args

    Handsontable.renderers.TextRenderer.apply(instance, args)

    const visualRowIndex = instance.toVisualRow(row)
    const visualColIndex = instance.toVisualColumn(column)
    const escapedString = escapeRegExp(query.current)
    const originalValue = value.toString() as string
    const hasModifiedFlag = visualColIndex !== 0 && originalValue.includes(ModifiedFlag)
    const _resultIndex = queryResult.current.findIndex(
      item => item.row === visualRowIndex && item.column === visualColIndex,
    )
    let _activeIndex = queryResult.current.slice(0, resultIndex.current).reduce((acc, cur) => acc + cur.count, 0)

    // 同时包含搜索样式与编辑样式
    if (_resultIndex !== -1 && hasModifiedFlag) {
      const html = originalValue.replace(new RegExp(escapedString, 'gi'), match => {
        const isActive = _resultIndex === resultIndex.current && _activeIndex === activeIndex.current
        const replacement = `<span style="background:${isActive ? '#faad14' : '#ffff00'}">${match}</span>`
        _activeIndex++
        return replacement
      })

      const spanRegex = /(<span style="[^"]+">.*?<\/span>)/gi
      // 分割字符串，保留分隔符（即<span>标签及其内容）
      const parts = html.split(spanRegex)
      const modifiedFlagIndex = originalValue.search(ModifiedFlag)
      // part 在原始字符串中的索引位置。
      let startIndex = 0

      td.innerHTML = parts
        .map(part => {
          // 如果部分是<span>标签，则直接返回
          const match = /<span style="[^"]+">(.*?)<\/span>/g.exec(part)

          if (match !== null) {
            startIndex += match[1].length
            return part
          }

          if (part.includes(ModifiedFlag)) {
            startIndex += part.length
            return part.replace(new RegExp(`(.*)(${ModifiedFlag})(.*)`), (_, p1, p2, p3) => {
              return `<span style="background: rgba(255, 129, 130, 0.4);">${p1}</span>${p2}<span style="background: rgb(171, 242, 188)">${p3}</span>`
            })
          }

          let result: string

          // 对比 "->" 符号在原始字符串中的索引位置与 part 的索引位置，以确定 part 的样式。
          if (startIndex + part.length <= modifiedFlagIndex) {
            result = `<span style="background: rgba(255, 129, 130, 0.4);">${part}</span>`
          } else if (startIndex >= modifiedFlagIndex + 2) {
            result = `<span style="background: rgb(171, 242, 188);">${part}</span>`
          } else if (startIndex + part.length === modifiedFlagIndex + 1) {
            result = `<span style="background: rgba(255, 129, 130, 0.4);">${part.slice(0, -1)}</span>-`
          } else {
            result = `><span style="background: rgb(171, 242, 188);">${part.slice(1)}</span>`
          }
          startIndex += part.length
          return result
        })
        .join('')

      // 只包含搜索样式
    } else if (_resultIndex !== -1) {
      td.innerHTML = originalValue.replace(new RegExp(escapedString, 'gi'), match => {
        const isActive = _resultIndex === resultIndex.current && _activeIndex === activeIndex.current
        const replacement = `<span style="background:${isActive ? '#faad14' : '#ffff00'}">${match}</span>`
        _activeIndex++
        return replacement
      })
      // 只包含编辑样式
    } else if (hasModifiedFlag) {
      td.innerHTML = originalValue.replace(new RegExp(`(.*)(${ModifiedFlag})(.*)`), (_, p1, p2, p3) => {
        return `<span style="background: rgba(255, 129, 130, 0.4);">${p1}</span>${p2}<span style="background: rgb(171, 242, 188)">${p3}</span>`
      })
    }
  }

  const cells = (row: number, column: number) => {
    const hot = hotRef.current?.hotInstance
    const cellProperties: Partial<CellProperties> = {}

    if (!hot) return cellProperties

    const visualRowIndex = hot.toVisualRow(row)
    const visualColIndex = hot.toVisualColumn(column)

    if (visualColIndex === 0) {
      cellProperties.className += ' htCenter'
    }

    const value = hot.getDataAtCell(visualRowIndex, visualColIndex).toString() as string

    if (visualColIndex === 0 && value.includes(ModifiedFlag)) {
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
    }

    cellProperties.renderer = cellRenderer

    return cellProperties
  }

  const copy = async () => {
    const hot = hotRef.current?.hotInstance
    if (!hot) return
    const htmlData = toHTML(hot, isFirstRowFlag)
    await copyHtmlToClipboard(htmlData)
  }

  const onSearch = (value: string) => {
    query.current = value

    const hot = hotRef.current?.hotInstance

    if (!hot) return

    const search = hot.getPlugin('search')

    let newTotal = 0
    const result: SearchResult[] = []

    search.query(
      value,
      (_instance, row, column, cellData, isResult) => {
        if (isResult) {
          const count = countString(cellData.toString(), value)

          newTotal += count

          result.push({
            row,
            column,
            data: cellData.toString(),
            count,
          })
        }
      },
      (queryStr, cellData) => {
        if (isEmpty(queryStr) || isEmpty(cellData)) {
          return false
        }

        return cellData.toString().toLowerCase().includes(queryStr.toLowerCase())
      },
    )

    resultIndex.current = 0
    activeIndex.current = 0
    queryResult.current = result
    setTotal(newTotal)
    hot.scrollViewportTo(result[0]?.row ?? 0, result[0]?.column ?? 0)
    hot.render()
  }

  if (loading) {
    return <Skeleton loading={loading} />
  }

  if (!data || data.length === 0) {
    return <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
  }

  return (
    <>
      <Space style={{ marginBottom: '16px' }}>
        <SearchInput total={total} prev={jump} next={jump} onSearch={onSearch} />
        <CopyButton onCopy={copy} />
      </Space>
      <HotTable
        readOnly
        copyable
        rowHeaders
        ref={hotRef}
        width="100%"
        colHeaders={colHeaders}
        data={data}
        cells={cells}
        rowHeights={rowHeights}
        height={height}
        fixedRowsTop={fixedRowsTop}
        fixedColumnsLeft={1}
        licenseKey="non-commercial-and-evaluation"
      />
    </>
  )
}

export default DiffTable
