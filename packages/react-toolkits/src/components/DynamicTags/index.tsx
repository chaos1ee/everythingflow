import { useTranslation } from '@/utils/i18n'
import { PlusOutlined } from '@ant-design/icons'
import type { InputRef } from 'antd'
import { Input, Space, Tag, theme } from 'antd'
import type { ChangeEvent, CSSProperties, FC } from 'react'
import { useEffect, useRef, useState } from 'react'

export interface DynamicTagsProps {
  initialTags?: string[]
  addable?: boolean
  removable?: boolean
  // 返回 Promise。如果返回 Promise.resolve(true)，则添加; 如果返回 Promise.resolve(false) 或 Promise.reject，则不添加
  addCallback?: (addedTag: string) => Promise<boolean>
  // 返回 Promise。如果返回 Promise.resolve(true)，则删除; 如果返回 Promise.resolve(false) 或 Promise.reject，则不删除
  removeCallback?: (removedTag: string) => Promise<boolean>
}

const DynamicTags: FC<DynamicTagsProps> = props => {
  const { initialTags, addable, removable, addCallback, removeCallback } = props
  const t = useTranslation()
  const { token } = theme.useToken()
  const [tags, setTags] = useState<string[]>([])
  const [inputVisible, setInputVisible] = useState(false)
  const [inputValue, setInputValue] = useState('')
  const [editInputIndex, setEditInputIndex] = useState(-1)
  const [editInputValue, setEditInputValue] = useState<string>('')
  const inputRef = useRef<InputRef>(null)
  const editInputRef = useRef<InputRef>(null)

  useEffect(() => {
    setTags(initialTags ?? [])
  }, [initialTags])

  useEffect(() => {
    if (inputVisible) {
      inputRef.current?.focus()
    }
  }, [inputVisible])

  useEffect(() => {
    editInputRef.current?.focus()
  }, [inputValue])

  const handleClose = async (removedTag: string) => {
    const success = await removeCallback?.(removedTag)

    if (success) {
      const newTags = tags.filter(tag => tag !== removedTag)
      setTags(newTags)
    }
  }

  const showInput = () => {
    setInputVisible(true)
  }

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value)
  }

  const handleInputConfirm = async () => {
    if (inputValue && tags.indexOf(inputValue) === -1) {
      const success = await addCallback?.(inputValue)

      if (success) {
        setTags([...tags, inputValue])
      }
    }

    setInputVisible(false)
    setInputValue('')
  }

  const handleEditInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setEditInputValue(e.target.value)
  }

  const handleEditInputConfirm = () => {
    const newTags = [...tags]
    newTags[editInputIndex] = editInputValue
    setTags(newTags)
    setEditInputIndex(-1)
    setInputValue('')
  }

  const tagInputStyle: CSSProperties = {
    width: 78,
    verticalAlign: 'top',
  }

  const tagPlusStyle: CSSProperties = {
    background: token.colorBgContainer,
    borderStyle: 'dashed',
  }

  return (
    <Space wrap size={[0, 8]}>
      <Space wrap size={[0, 8]}>
        {tags.map((tag, index) => {
          if (editInputIndex === index) {
            return (
              <Input
                ref={editInputRef}
                key={tag}
                size="small"
                style={tagInputStyle}
                value={editInputValue}
                onChange={handleEditInputChange}
                onBlur={handleEditInputConfirm}
                onPressEnter={handleEditInputConfirm}
              />
            )
          }

          return (
            <Tag
              key={tag}
              closable={removable}
              style={{ userSelect: 'none' }}
              onClose={async e => {
                e.preventDefault()
                await handleClose(tag)
              }}
            >
              <span
                onDoubleClick={e => {
                  if (index !== 0) {
                    setEditInputIndex(index)
                    setEditInputValue(tag)
                    e.preventDefault()
                  }
                }}
              >
                {tag}
              </span>
            </Tag>
          )
        })}
      </Space>
      {addable &&
        (inputVisible ? (
          <Input
            ref={inputRef}
            type="text"
            size="small"
            style={tagInputStyle}
            value={inputValue}
            onChange={handleInputChange}
            onBlur={handleInputConfirm}
            onPressEnter={handleInputConfirm}
          />
        ) : (
          <Tag style={tagPlusStyle} onClick={showInput}>
            <PlusOutlined />
            &nbsp;{t('global.add')}
          </Tag>
        ))}
    </Space>
  )
}

export default DynamicTags
