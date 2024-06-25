import { Typography } from 'antd'
import type { ParagraphProps } from 'antd/es/typography/Paragraph'
import type { FC } from 'react'
import { useState } from 'react'

type ExpandableParagraphProps = Omit<ParagraphProps, 'ellipsis' | 'className'>

const ExpandableParagraph: FC<ExpandableParagraphProps> = props => {
  const { children, ...restProps } = props
  const [expanded, setExpanded] = useState(false)

  return (
    <Typography.Paragraph
      {...restProps}
      className="mb-0"
      ellipsis={{
        rows: 2,
        expandable: 'collapsible',
        expanded,
        onExpand: (_, info) => {
          setExpanded(info.expanded)
        },
      }}
    >
      {children}
    </Typography.Paragraph>
  )
}

export default ExpandableParagraph
