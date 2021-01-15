import * as React from 'react'
import { convertText } from 'cfn-template-yaml-to-js'
import InputOutputView from './InputOutputView'

// @ts-ignore
import example from '!!raw-loader!./examples/cfn-template.yaml'

export default function CfnTemplateYamlToJs(): React.ReactElement<any, any> {
  return (
    <InputOutputView
      storageKey="cfn-template-yaml-to-js"
      inputTitle="YAML Cloudformation Template"
      outputTitle="JS Output"
      transform={convertText}
      example={example}
    />
  )
}
