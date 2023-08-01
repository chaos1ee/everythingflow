import type { PropsWithChildren, ReactNode } from 'react'
import { useEffect, useState } from 'react'
import { flushSync } from 'react-dom'
import { createRoot } from 'react-dom/client'

const splitByTags = (str: string) => {
  const regex = /(<[^>]*>)/
  return str.split(regex).filter(part => part !== '')
}

function renderToString(node: ReactNode): Promise<string> {
  const container = document.createElement('div')
  const root = createRoot(container)

  return new Promise(resolve => {
    setTimeout(() => {
      flushSync(() => {
        root.render(node)
      })
      resolve(container.innerHTML)
    })
  })
}

export interface HighlightTextsProps extends PropsWithChildren {
  texts: Array<string | number>
}

const Highlight = (props: HighlightTextsProps) => {
  const { texts, children } = props
  const [htmlString, setHtmlString] = useState<string>('')

  useEffect(() => {
    renderToString(children).then(str => {
      const result = splitByTags(str)

      for (const text of texts) {
        for (let index = 0; index < result.length; index++) {
          // TODO: 忽略 HTML tag
          result[index] = result[index].replace(String(text), `<span style='color: #DC143C;'>${text}</span>`)
        }
      }

      setHtmlString(result.join(''))
    })
  }, [children, texts])

  return <p dangerouslySetInnerHTML={{ __html: htmlString }}></p>
}

export default Highlight
