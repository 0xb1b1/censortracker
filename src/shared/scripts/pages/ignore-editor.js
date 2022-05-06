import 'codemirror/addon/search/search'
import 'codemirror/addon/search/matchesonscrollbar'
import 'codemirror/addon/search/searchcursor'
import 'codemirror/addon/display/autorefresh'
import 'codemirror/lib/codemirror.css'

import CodeMirror from 'codemirror'

import Ignore from '../ignore'
import { validateUrls } from '../utilities'

(async () => {
  const ignoredHosts = await Ignore.getAll()
  const searchInput = document.getElementById('search')
  const ignoredList = document.getElementById('ignoreList')

  const content = ignoredHosts.join('\n')
  const editor = CodeMirror.fromTextArea(
    ignoredList, {
      autorefresh: true,
      lineNumbers: true,
      lineWrapping: true,
      mode: 'text/x-mysql',
      styleActiveLine: true,
      styleActiveSelected: true,
      disableSpellcheck: true,
    },
  )

  editor.setValue(content)

  document.addEventListener('keydown', async (event) => {
    if ((event.ctrlKey && event.key === 's') || event.keyCode === 13) {
      const editorContent = editor.getValue().trim()

      Ignore.clear().then(async () => {
        const urls = editorContent.split('\n')
        const validUrls = validateUrls(urls)

        for (const url of validUrls) {
          await Ignore.add(url)
        }
      })

      console.warn('Ignore list updated')
      event.preventDefault()
    }
  })

  searchInput.addEventListener('input', () => {
    // Returns an array containing all marked ranges in the document.
    for (const marker of editor.getAllMarks()) {
      marker.clear()
    }

    const value = searchInput.value
    const cursor = editor.getSearchCursor(value)

    console.log(`Searching for: ${value}...`)

    while (cursor.findNext()) {
      // Mark a range of text with a specific CSS class name.
      editor.markText(
        cursor.from(),
        cursor.to(),
        {
          className: 'highlight',
        },
      )
    }
  })
})()
