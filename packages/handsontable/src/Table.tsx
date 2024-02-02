import type { HotTableProps } from '@handsontable/react'
import { HotTable } from '@handsontable/react'
import type HotTableClass from '@handsontable/react/hotTableClass'
import Empty from 'antd/es/empty'
import Skeleton from 'antd/es/skeleton'
import Space from 'antd/es/space'
import type Handsontable from 'handsontable'
import 'handsontable/dist/handsontable.full.min.css'
import { registerLanguageDictionary, zhCN } from 'handsontable/i18n'
import { AutoColumnSize, Search, registerPlugin } from 'handsontable/plugins'
import { forwardRef, useImperativeHandle, useRef, useState } from 'react'
import CopyButton from './CopyButton'
import SearchInput from './SearchInput'
import { useHeight, useRowHeights } from './hooks'
import './style.css'
import { copyHtmlToClipboard, countString, escapeRegExp, instanceToHTML, isEmpty } from './utils'

registerLanguageDictionary(zhCN)
registerPlugin(AutoColumnSize)
registerPlugin(Search)

export interface SearchResult {
  row: number
  column: number
  data: string
  // 目标字符串出现次数
  count: number
}

export interface TableProps extends Omit<HotTableProps, 'width'> {
  loading?: boolean
  // 自定义生成的 HTML，复制到剪贴板时调用。一般不需要自定义，但在某些情况下按照特定方式构造的 DOM string 可以在粘贴时保留样式。比如从 DiffTable 复制的内容可以在粘贴到 Google Sheets 或飞书等在线表格工具时保留样式。
  toHTML?: (instance: Handsontable) => string
}

export type TableRef = HotTableClass

const Table = forwardRef<TableRef, TableProps>(function FunTable(props, ref) {
  const { toHTML, loading, data, fixedRowsTop, height, afterRenderer, ...restProps } = props
  const rowHeights = useRowHeights(data)
  const dynamicHeight = useHeight(data, true, fixedRowsTop)
  const hotRef = useRef<HotTableClass>(null)
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

  const afterRendererHandler: HotTableProps['afterRenderer'] = (td, row, column, prop, value, cellProperties) => {
    afterRenderer?.(td, row, column, prop, value, cellProperties)

    const hot = hotRef.current?.hotInstance
    if (!hot) return

    const originalValue = value.toString() as string
    const escapedString = escapeRegExp(query.current)
    const _resultIndex = queryResult.current.findIndex(item => item.row === row && item.column === column)

    // FIXME: 会与 DiffTable 的 afterRenderer 内的逻辑冲突，导致单元格原本的 diff 样式被清除（当单元格的内容类似“xxx->12312”时）
    if (_resultIndex !== -1) {
      let _activeIndex = queryResult.current.slice(0, resultIndex.current).reduce((acc, cur) => acc + cur.count, 0)
      td.innerHTML = originalValue.replace(new RegExp(escapedString, 'gi'), match => {
        const isActive = _resultIndex === resultIndex.current && _activeIndex === activeIndex.current
        const replacement = `<span style="background:${isActive ? '#faad14' : '#ffff00'};color: #000;">${match}</span>`
        _activeIndex++
        return replacement
      })
    }
  }

  const onCopy = async () => {
    const hot = hotRef.current?.hotInstance
    if (!hot) return
    const htmlData = toHTML?.(hot) || instanceToHTML(hot)
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

  useImperativeHandle(ref, () => hotRef.current as HotTableClass)

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
        <CopyButton onCopy={onCopy} />
      </Space>
      <HotTable
        {...restProps}
        width="100%"
        ref={hotRef}
        data={data}
        height={height || dynamicHeight}
        rowHeights={rowHeights}
        language={zhCN.languageCode}
        fixedRowsTop={fixedRowsTop}
        afterRenderer={afterRendererHandler}
        licenseKey="non-commercial-and-evaluation"
      />
    </>
  )
})

export default Table
