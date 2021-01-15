import * as React from 'react'
import Typography from '@material-ui/core/Typography'
import CircularProgress from '@material-ui/core/CircularProgress'
import { makeStyles, Theme } from '@material-ui/core/styles'
import debounce from 'lodash/debounce'
import classNames from 'classnames'
import useQueryParams from './useQueryParams'

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    flex: '1 1 auto',
    marginTop: theme.spacing(1),
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'stretch',
    alignContent: 'stretch',
  },
  input: {
    flex: '0 0 50%',
    display: 'flex',
    flexDirection: 'column',
  },
  output: {
    flex: '0 0 50%',
    display: 'flex',
    flexDirection: 'column',
  },
  textarea: {
    border: 'none',
    flex: '1 1 auto',
    fontFamily: 'monospace',
    whiteSpace: 'pre',
    fontSize: theme.typography.pxToRem(14),
    '&:not(:first-child)': {
      borderLeft: '1px solid #ddd',
    },
  },
  error: {
    color: 'red',
  },
}))

export type Props = {
  storageKey: string
  inputTitle: React.ReactNode
  outputTitle: React.ReactNode
  transform: (input: string) => string | Promise<string>
  example?: string
}

export default function InputOutputView({
  storageKey,
  inputTitle,
  outputTitle,
  transform,
  example = '',
  ...props
}: Props): React.ReactElement<any, any> {
  const classes = useStyles(props)
  const [queryParams, setQueryParams] = useQueryParams<{ input?: string }>()
  const setInput = React.useCallback(
    (input: string) => {
      setQueryParams({ input })
      localStorage.setItem(storageKey, input)
    },
    [setQueryParams]
  )
  const { input = '' } = queryParams

  React.useEffect(() => {
    if (queryParams.input == null) {
      setInput(localStorage.getItem(storageKey) || example)
    }
  }, [example])

  const [output, setOutput] = React.useState<string | Error>('')
  const [updating, setUpdating] = React.useState(false)

  const handleInputChange = React.useCallback(
    (event: React.ChangeEvent<any>) => {
      setInput(event.target.value)
    },
    [setInput]
  )

  const updateOutput = React.useMemo(
    () =>
      debounce(async (input: string): Promise<void> => {
        let converted: string | Error
        try {
          converted = await transform(input)
        } catch (error) {
          converted = error
        }
        setOutput(converted)
        setUpdating(false)
      }, 250),
    [setOutput, setUpdating]
  )

  React.useEffect(() => {
    setUpdating(true)
    updateOutput(input)
  }, [input, setUpdating, updateOutput])

  return (
    <div className={classes.root}>
      <div className={classes.input}>
        <Typography variant="h6" color="initial">
          {inputTitle}
        </Typography>
        <textarea
          value={input}
          className={classes.textarea}
          onChange={handleInputChange}
        />
      </div>
      <div className={classes.output}>
        <Typography variant="h6" color="initial">
          {outputTitle}
        </Typography>
        {updating ? (
          <CircularProgress variant="indeterminate" />
        ) : (
          <textarea
            value={output instanceof Error ? output.message : output}
            readOnly
            className={classNames(classes.textarea, {
              [classes.error]: output instanceof Error,
            })}
          />
        )}
      </div>
    </div>
  )
}
