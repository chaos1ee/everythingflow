import { DiffTable } from '@love1t/handsontable'
import { Card } from 'antd'
import { useEffect } from 'react'
import { request } from 'react-toolkits'
import useSWR from 'swr'

const HandsontableDiffTable = () => {
  const { data, isLoading } = useSWR('/api/table/diff', url =>
    request<{ title: string[][]; data: string[][] }>(url).then(response => response.data),
  )

  useEffect(() => {
    console.log('render')
  }, [])

  return (
    <Card title="差异表格">
      <DiffTable readOnly header={data?.title} body={data?.data} loading={isLoading} />
    </Card>
  )
}

export default HandsontableDiffTable
