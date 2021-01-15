import * as React from 'react'
import { convertCssToJssString } from 'jss-codemorphs'
import InputOutputView from './InputOutputView'

const example = `@keyframes alarm {
  from {
    color: red;
  }
  50% {
    color: initial;
  }
  to {
    color: red;
  }
}
.foo {
  color: green;
  & .bar-qux, & .glorm:after {
    color: red;
  }
  & .baz:after {
    content: 'whoo';
  }
}
.glorm {
  color: green;
  display: box;
  display: flex-box;
  display: flex;
}
.bar-qux {
  color: white;
  animation: alarm 1s linear infinite;
}
@media screen {
  a {
    text-decoration: none;
    .foo {
      color: brown;
    }
  }
  .foo {
    & .bar-qux {
      color: orange;
    }
  }
}
`

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
