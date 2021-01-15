import * as React from 'react'
import { HashRouter } from 'react-router-dom'
import Main from './Main'

export default function Root(): React.ReactElement<any, any> {
  return (
    <HashRouter>
      <Main />
    </HashRouter>
  )
}
