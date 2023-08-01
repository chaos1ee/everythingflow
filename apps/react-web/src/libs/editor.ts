/* eslint-disable no-template-curly-in-string */
import * as monaco from 'monaco-editor'
import {loader} from '@monaco-editor/react'
import {language as sqlLanguage} from 'monaco-sql-languages/out/esm/sql/sql'
import {language as mySqlLanguage} from 'monaco-sql-languages/out/esm/mysql/mysql'

self.MonacoEnvironment = {
  getWorker(_, label: string) {
    if (label === 'mysql' || label === 'sql') {
      return new Worker(new URL('../../node_modules/monaco-sql-languages/out/esm/mysql/mysql.worker', import.meta.url))
    }
    return new Worker(new URL('../../node_modules/monaco-editor/esm/vs/editor/editor.worker', import.meta.url))
  },
}

monaco.languages.registerCompletionItemProvider('sql', {
  provideCompletionItems: function (model, position) {
    const keywords: string[] = [...new Set([...sqlLanguage.keywords, ...mySqlLanguage.keywords])]

    const values = ['table']

    const suggestions = [
      ...keywords.map(item => ({
        label: item,
        kind: monaco.languages.CompletionItemKind.Keyword,
        insertText: item,
        range: new monaco.Range(position.lineNumber, position.column - 1, position.lineNumber, position.column),
      })),
      ...values.map(item => ({
        label: item,
        kind: monaco.languages.CompletionItemKind.Value,
        insertText: item,
        range: new monaco.Range(position.lineNumber, position.column - 1, position.lineNumber, position.column),
      })),
    ]

    return {
      suggestions,
    }
  },
})

loader.config({ monaco })

loader.init().then()
