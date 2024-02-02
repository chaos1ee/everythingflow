import { CaretRightOutlined } from '@ant-design/icons'
import { DiffTable } from '@love1t/handsontable'
import { Card, Collapse } from 'antd'
import { request } from 'react-toolkits'
import useSWR from 'swr'

const DiffCollapse = () => {
  const { data } = useSWR('/api/table/collapse', url =>
    request<{ name: string; title: string[][]; data: string[][] }[]>(url).then(response => response.data),
  )

  const items = data?.map(item => ({
    key: item.name,
    label: item.name,
    children: <DiffTable colHeaders rowHeaders header={item.title} body={item.data} stretchH="all" />,
  }))

  return (
    <Card title="Diff Collapse">
      <Collapse
        accordion
        destroyInactivePanel
        style={{ width: '100%' }}
        collapsible="icon"
        bordered={false}
        expandIcon={({ isActive }) => <CaretRightOutlined rotate={isActive ? 90 : 0} />}
        items={items}
      />
    </Card>
  )
}

export default DiffCollapse
