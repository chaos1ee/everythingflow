import { CheckOutlined, CopyOutlined } from '@ant-design/icons'
import { Button } from 'antd'
import type { FC } from 'react'
import { useRef, useState } from 'react'

export interface CopyButtonProps {
  onCopy?: () => void | Promise<void>
}

const CopyButton: FC<CopyButtonProps> = props => {
  const { onCopy } = props
  const [copied, setCopied] = useState(false)
  const timeoutId = useRef<number>()

  const onClick = async () => {
    window.clearTimeout(timeoutId.current)

    await onCopy?.()
    setCopied(true)

    timeoutId.current = window.setTimeout(() => {
      setCopied(false)
    }, 2000)
  }

  return (
    <>
      <Button
        type="text"
        icon={copied ? <CheckOutlined style={{ color: '#52c41a', fontWeight: 'bold' }} /> : <CopyOutlined />}
        onClick={onClick}
      >
        复制表格到剪贴板
      </Button>
    </>
  )
}

export default CopyButton
