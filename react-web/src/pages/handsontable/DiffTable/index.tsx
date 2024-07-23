import { DiffTable } from '@flow97/handsontable'
import { Card } from 'antd'
import { request } from 'react-toolkits'
import useSWR from 'swr'

const HandsontableDiffTable = () => {
  const { data, isLoading } = useSWR('/api/table/diff', url =>
    request<{ title: string[][]; data: string[][] }>(url).then(response => response.data),
  )

  return (
    <Card title="差异表格">
      <DiffTable colHeaders rowHeaders readOnly header={data?.title} body={data?.data} loading={isLoading} />
    </Card>
  )
}

export default HandsontableDiffTable
