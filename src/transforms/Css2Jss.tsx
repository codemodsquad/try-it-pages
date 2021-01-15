import * as React from 'react'
import { convertCssToJssString } from 'jss-codemorphs'
import InputOutputView from '../InputOutputView'

// @ts-ignore
import example from '!!raw-loader!../examples/css2jss.css'

export default function Css2Jss(): React.ReactElement<any, any> {
  return (
    <InputOutputView
      storageKey="css2jss"
      inputTitle="Input CSS"
      outputTitle="Output JSS"
      transform={convertCssToJssString}
      example={example}
    />
  )
}
