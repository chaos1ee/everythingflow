import { useWindowSize } from '@uidotdev/usehooks'
import type { GridSettings } from 'handsontable/settings'
import { useMemo } from 'react'

const BorderWidth = 1
const LineHeight = 21
const HeaderPadding = 2

export function useRowHeights(data: GridSettings['data']) {
  return useMemo(() => {
    const DefaultHandsontableRowHeight = 23
    const rowHeights: number[] = new Array(data?.length ?? 0).fill(DefaultHandsontableRowHeight)

    data?.forEach((row, rowIndex) => {
      row.forEach((cell: string) => {
        const lines = (cell ?? '').split('\n').length

        if (lines > 1) {
          rowHeights[rowIndex] = lines * LineHeight + BorderWidth
        }
      })
    })

    return rowHeights
  }, [data])
}

function useHeaderHeight(colHeaders?: GridSettings['colHeaders']) {
  return colHeaders ? LineHeight + HeaderPadding * 2 + BorderWidth : 0
}

function useFixedHeight(
  data: GridSettings['data'],
  colHeaders?: GridSettings['colHeaders'],
  fixedRowsTop?: GridSettings['fixedRowsTop'],
) {
  const rowHeights = useRowHeights(data)
  const headerHeight = useHeaderHeight(colHeaders)
  return rowHeights.slice(0, fixedRowsTop).reduce((acc, curr) => acc + curr, headerHeight) + BorderWidth
}

export function useHeight(
  data: GridSettings['data'],
  colHeaders?: GridSettings['colHeaders'],
  fixedRowsTop?: GridSettings['fixedRowsTop'],
  leftHeight = 200,
) {
  const size = useWindowSize()
  const rowHeights = useRowHeights(data)
  const fixedHeight = useFixedHeight(data, colHeaders, fixedRowsTop)
  const headerHeight = useHeaderHeight(colHeaders)
  const maxHeight = (size?.height ?? window.innerHeight) - leftHeight
  const height = rowHeights.reduce((acc, curr) => acc + curr, headerHeight) + BorderWidth

  fixedRowsTop = fixedRowsTop ?? 0

  if (fixedHeight > maxHeight) {
    // 如果固定高度大于最大高度，则最多展示 10 行。
    if (rowHeights.length - fixedRowsTop > 10) {
      return fixedHeight + rowHeights.slice(fixedRowsTop, fixedRowsTop + 10).reduce((acc, curr) => acc + curr, 0)
    } else {
      return 'auto'
    }
  } else if (height >= maxHeight) {
    return maxHeight
  } else {
    return 'auto'
  }
}
