import * as React from 'react'
import AppBar from '@material-ui/core/AppBar'
import Toolbar from '@material-ui/core/Toolbar'
import Select from '@material-ui/core/Select'
import MenuItem from '@material-ui/core/MenuItem'
import { makeStyles, Theme } from '@material-ui/core/styles'
import { Route, Link, useRouteMatch, useHistory } from 'react-router-dom'
import Loading from './Loading'
import loadable from '@loadable/component'

const Css2Jss = loadable(() => import('./css2jss'), {
  fallback: <Loading />,
})
const CfnTemplateYamlToJs = loadable(() => import('./CfnTemplateYamlToJs'), {
  fallback: <Loading />,
})

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    display: 'flex',
    flexDirection: 'column',
  },
  main: {
    flex: '1 1 auto',
    marginTop: theme.spacing(1),
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'stretch',
    alignContent: 'stretch',
  },
  transformSelector: {
    color: 'white',
  },
  transformSelectorIcon: {
    color: 'white',
  },
}))

export default function Main(): React.ReactElement<any, any> {
  const classes = useStyles()
  const history = useHistory()
  const match = useRouteMatch<{ transform?: string }>('/:transform')

  const transform = match?.params?.transform

  React.useEffect(() => {
    if (!transform) history.push(`/css2jss`)
  }, [transform])

  return (
    <div className={classes.root}>
      <AppBar position="static" color="primary">
        <Toolbar>
          <Select
            value={transform}
            classes={{
              root: classes.transformSelector,
              icon: classes.transformSelectorIcon,
            }}
            disableUnderline
          >
            <MenuItem value="css2jss" component={Link as any} to="/css2jss">
              CSS To JSS
            </MenuItem>
            <MenuItem
              value="cfn-template-yaml-to-js"
              component={Link as any}
              to="/cfn-template-yaml-to-js"
            >
              CloudFormation Template YAML to JS
            </MenuItem>
          </Select>
        </Toolbar>
      </AppBar>
      <div className={classes.main}>
        <Route path="/css2jss" component={Css2Jss} />
        <Route
          path="/cfn-template-yaml-to-js"
          component={CfnTemplateYamlToJs}
        />
      </div>
    </div>
  )
}
