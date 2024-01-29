import { LeftOutlined, RightOutlined, SearchOutlined } from '@ant-design/icons'
import { useDebounce } from '@uidotdev/usehooks'
import { Button, Input, Typography, theme } from 'antd'
import type { ChangeEvent, FC } from 'react'
import { useEffect, useState } from 'react'

export interface SearchInputProps {
  total?: number
  onSearch?: (value: string) => void
  prev?: (index: number) => void
  next?: (index: number) => void
}

const SearchInput: FC<SearchInputProps> = props => {
  const { total = 0, onSearch, prev, next } = props
  const { token } = theme.useToken()
  const [activeIndex, setActiveIndex] = useState(0)
  const [query, setQuery] = useState<string>('')
  const debouncedQuery = useDebounce(query, 200)
  const iconStyles = {
    color: token.colorTextSecondary,
    fontSize: 12,
  }

  const onChange = (event: ChangeEvent<HTMLInputElement>) => {
    setQuery(event.target.value)
    setActiveIndex(0)
  }

  const onPrevClick = () => {
    const currentIndex = (activeIndex - 1 + total) % total
    setActiveIndex(currentIndex)
    prev?.(currentIndex)
  }

  const onNextClick = () => {
    const currentIndex = (activeIndex + 1) % total
    setActiveIndex(currentIndex)
    next?.(currentIndex)
  }

  useEffect(() => {
    onSearch?.(debouncedQuery)
  }, [debouncedQuery])

  return (
    <Input
      style={{ width: 300 }}
      prefix={<SearchOutlined style={iconStyles} />}
      suffix={
        <>
          <Button
            size="small"
            type="text"
            disabled={total === 0}
            icon={<LeftOutlined style={iconStyles} />}
            onClick={onPrevClick}
          />
          <Typography.Text type="secondary">
            {total && activeIndex + 1}/{total}
          </Typography.Text>
          <Button
            size="small"
            type="text"
            disabled={total === 0}
            icon={<RightOutlined style={iconStyles} />}
            onClick={onNextClick}
          />
        </>
      }
      onChange={onChange}
    />
  )
}

export default SearchInput
