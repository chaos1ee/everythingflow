import { useWindowSize } from '@uidotdev/usehooks'
import { useMemo } from 'react'
import type { GridSettings } from 'handsontable/settings'

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

function useHeaderHeight(colHeaders: GridSettings['colHeaders']) {
  return typeof colHeaders !== 'undefined' ? LineHeight + HeaderPadding * 2 + BorderWidth : 0
}

export function useFixedHeight(
  data: GridSettings['data'],
  fixedRowsTop: number,
  colHeaders: GridSettings['colHeaders'],
) {
  const rowHeights = useRowHeights(data)
  const headerHeight = useHeaderHeight(colHeaders)

  if (typeof fixedRowsTop === 'undefined') {
    return 0
  }

  return rowHeights.slice(0, fixedRowsTop).reduce((acc, curr) => acc + curr, headerHeight) + BorderWidth
}

export function useHeight(
  data: GridSettings['data'],
  fixedRowsTop: number,
  colHeaders: GridSettings['colHeaders'],
  leftHeight = 200,
) {
  const size = useWindowSize()
  const rowHeights = useRowHeights(data)
  const fixedHeight = useFixedHeight(data, fixedRowsTop, colHeaders)
  const headerHeight = useHeaderHeight(colHeaders)
  const maxHeight = (size?.height ?? window.innerHeight) - leftHeight
  const height = rowHeights.reduce((acc, curr) => acc + curr, headerHeight) + BorderWidth

  if (fixedHeight > maxHeight) {
    // 如果固定高度大于最大高度，且除去剩余行的行数大于 10 行，就加上除去固定行前 10 行的高度。
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
