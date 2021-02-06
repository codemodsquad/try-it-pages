import * as React from 'react'
import InputOutputView from '../InputOutputView'

// @ts-ignore
import example from '!!raw-loader!../examples/sistema-oaxaca.wpj'

type View = 'North or East' | 'North or West' | 'North' | 'East' | 'West'

type DecodedStatus = {
  detached: boolean
  nameDefinesSegment: boolean
  displayUnit: 'feet' | 'meters'
  useGeoreference?: boolean
  deriveDeclFromDate?: boolean
  utmGridRelative?: boolean
  preserveVerticalShotOrientation?: boolean
  preserveVerticalShotLength?: boolean
  typeIsOther: boolean
  launchAction?: 'edit' | 'open'
  defaultViewAfterCompilation?: View
  processSourceSvgIfAttached: boolean
}

// status BITS
// 2^0 : Type = Book
// 2^1 : detached
// 2^2 : ? (maybe this is whether it's compiled?)
// 2^3 : name defines segment
// 2^4 : 1 = Feet, 0 = Meters
// 2^5 : ? (FLG_WESTWARD in Walls source code, not sure if it's still used?)
// In the following cases, if both the no and the yes bit are 0,
// the value is inherited from the parent instead.
// Use georeference:
// 2^6 : 1 = no
// 2^7 : 1 = yes
// flag though)
// Derive decl from date:
// 2^8 : 1 = no
// 2^9 : 1 = yes
// UTM/GPS Grid-relative:
// 2^10: 1 = no
// 2^11: 1 = yes
// Preserve vertical shot orientation:
// 2^12: 1 = no
// 2^13: 1 = yes
// Preserve vertical shot length:
// 2^14: 1 = no
// 2^15: 1 = yes
// Other type
// 2^16: 1 = type is other (FLG_SURVEYNOT in Walls source code)
// 2^17: edit on launch
// 2^18: open on launch
// Default view after compilation (bits 21-19):
// 1: North or East
// 10: North or West
// 11: North
// 100: East
// 101: West
//
// 2^22: Process source SVG if one is attached

function decodeDefaultViewAfterCompilation(value: number): View | undefined {
  switch (value) {
    case 1:
      return 'North or East'
    case 2:
      return 'North or West'
    case 3:
      return 'North'
    case 4:
      return 'East'
    case 5:
      return 'West'
  }
}

function decodeStatus(status: number): DecodedStatus {
  const bit = (idx: number): boolean => Boolean(status & (1 << idx))

  return {
    detached: bit(1),
    nameDefinesSegment: bit(3),
    displayUnit: bit(4) ? 'feet' : 'meters',
    useGeoreference: bit(6) ? false : bit(7) ? true : undefined,
    deriveDeclFromDate: bit(8) ? false : bit(9) ? true : undefined,
    utmGridRelative: bit(10) ? false : bit(11) ? true : undefined,
    preserveVerticalShotOrientation: bit(12)
      ? false
      : bit(13)
      ? true
      : undefined,
    preserveVerticalShotLength: bit(14) ? false : bit(15) ? true : undefined,
    typeIsOther: bit(16),
    launchAction: bit(17) ? 'edit' : bit(18) ? 'open' : undefined,
    defaultViewAfterCompilation: decodeDefaultViewAfterCompilation(
      (status >> 19) & 0x7
    ),
    processSourceSvgIfAttached: bit(22),
  }
}

function decodeWpjStatus(input: string): string {
  const bookStack: { status?: DecodedStatus }[] = []

  function inherited<K extends keyof DecodedStatus>(
    key: K
  ): DecodedStatus[K] | undefined {
    for (let i = bookStack.length - 1; i >= 0; i--) {
      const { status } = bookStack[i]
      if (!status) continue
      if (status[key] != null) return status[key]
    }
  }

  return input.replace(
    /^\s*\.(BOOK|ENDBOOK|STATUS\s+(\d+))[^\r\n]*/gm,
    (match: string, directive: string, status?: string): string => {
      if (directive.toUpperCase().startsWith('BOOK')) {
        bookStack.push({})
      } else if (directive.toUpperCase().startsWith('ENDBOOK')) {
        bookStack.pop()
      }
      const topBook = bookStack[bookStack.length - 1]
      if (status) {
        const decodedStatus = decodeStatus(parseInt(status))
        if (topBook && !topBook.status) topBook.status = decodedStatus

        const formatValue = <K extends keyof DecodedStatus>(key: K): string => {
          const value = decodedStatus[key]
          if (typeof value === 'string') return String(value)
          if (value === true) return 'yes'
          if (value === false) return 'no'
          const inheritedValue = inherited(key)
          return `${
            inheritedValue === true
              ? 'yes'
              : inheritedValue === false
              ? 'no'
              : inheritedValue == null
              ? 'null'
              : String(inheritedValue)
          } (inherited)`
        }

        const lines = []
        lines.push(
          `; detached:                       ${formatValue('detached')}`
        )
        lines.push(
          `; name defines segment:           ${formatValue(
            'nameDefinesSegment'
          )}`
        )
        lines.push(
          `; display unit:                   ${formatValue('displayUnit')}`
        )
        lines.push(
          `; use georeference:               ${formatValue('useGeoreference')}`
        )
        lines.push(
          `; derive decl from date:          ${formatValue(
            'deriveDeclFromDate'
          )}`
        )
        lines.push(
          `; UTM/GPT grid relative:          ${formatValue('utmGridRelative')}`
        )
        lines.push(
          `; preserve vert shot orientation: ${formatValue(
            'preserveVerticalShotOrientation'
          )}`
        )
        lines.push(
          `; preserve vert shot length:      ${formatValue(
            'preserveVerticalShotLength'
          )}`
        )
        lines.push(
          `; file is survey notes or other:  ${formatValue('typeIsOther')}`
        )
        lines.push(
          `; launch action:                  ${formatValue('launchAction')}`
        )
        lines.push(
          `; default view after compilation: ${formatValue(
            'defaultViewAfterCompilation'
          )}`
        )
        lines.push(
          `; process source svg if attached: ${formatValue(
            'processSourceSvgIfAttached'
          )}`
        )
        lines.push(match)

        return lines.join('\r\n')
      }
      return match
    }
  )
}

export default function WpjStatusDecoder(): React.ReactElement<any, any> {
  return (
    <InputOutputView
      storageKey="cfn-template-yaml-to-js"
      inputTitle="Input .wpj file"
      outputTitle="Annotated .wpj file"
      transform={decodeWpjStatus}
      example={example}
    />
  )
}
