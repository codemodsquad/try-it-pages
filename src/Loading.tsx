import * as React from 'react'
import Typography from '@material-ui/core/Typography'
import CircularProgress from '@material-ui/core/CircularProgress'

export default function Loading(): React.ReactElement<any, any> {
  return (
    <Typography variant="h6" color="initial">
      <CircularProgress /> Loading...
    </Typography>
  )
}
