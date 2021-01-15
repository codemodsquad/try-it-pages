import * as React from 'react'
import { useLocation, useHistory } from 'react-router-dom'

export default function useQueryParams<P extends {}>(): [
  P,
  (newParams: Partial<P>) => void
] {
  const history = useHistory()
  const { pathname, search } = useLocation()
  const queryParams = React.useMemo(() => new URLSearchParams(search), [search])
  const setQueryParams = React.useCallback(
    (newParams: Partial<P>) => {
      const final = new URLSearchParams(queryParams)
      for (const [key, value] of Object.entries(newParams)) {
        final.set(key, value as any)
      }
      history.push({ pathname, search: `?${final.toString()}` })
    },
    [queryParams]
  )
  return [Object.fromEntries(queryParams.entries()) as any, setQueryParams]
}
