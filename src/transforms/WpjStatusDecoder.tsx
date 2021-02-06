import * as React from 'react'
import InputOutputView from '../InputOutputView'

// @ts-ignore
import example from '!!raw-loader!../examples/sistema-oaxaca.wpj'

type View = 'north or east' | 'north or west' | 'north' | 'east' | 'west'

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
  launchAction: 'properties' | 'edit' | 'open'
  defaultViewAfterCompilation?: View
  processSourceSvgIfAttached: boolean
}

// status BITS
// 2^0 : Type = Book
// 2^1 : detached
// 2^2 : ? (maybe this is whether it's compiled?)
// 2^3 : name defines segment
// 2^4 : 1 = Feet, 0 = Meters
// 2^5 : ? (FLG_westWARD in Walls source code, not sure if it's still used?)
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
// 1: north or east
// 10: north or west
// 11: north
// 100: east
// 101: west
//
// 2^22: Process source SVG if one is attached

function decodeDefaultViewAfterCompilation(value: number): View | undefined {
  switch (value) {
    case 1:
      return 'north or east'
    case 2:
      return 'north or west'
    case 3:
      return 'north'
    case 4:
      return 'east'
    case 5:
      return 'west'
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
    launchAction: bit(17) ? 'edit' : bit(18) ? 'open' : 'properties',
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

        const formatValue = <K extends keyof DecodedStatus>(
          key: K,
          defaultValue: DecodedStatus[K]
        ): string => {
          const value = decodedStatus[key]
          if (typeof value === 'string') return String(value)
          if (value === true) return 'yes'
          if (value === false) return 'no'
          const inheritedValue = inherited(key) ?? defaultValue
          return `${
            inheritedValue === true
              ? 'yes'
              : inheritedValue === false
              ? 'no'
              : String(inheritedValue)
          } (inherited)`
        }

        const lines = []
        lines.push(
          `; detached:                       ${formatValue('detached', false)}`
        )
        lines.push(
          `; name defines segment:           ${formatValue(
            'nameDefinesSegment',
            false
          )}`
        )
        lines.push(
          `; display unit:                   ${formatValue(
            'displayUnit',
            'meters'
          )}`
        )
        lines.push(
          `; use georeference:               ${formatValue(
            'useGeoreference',
            false
          )}`
        )
        lines.push(
          `; derive decl from date:          ${formatValue(
            'deriveDeclFromDate',
            false
          )}`
        )
        lines.push(
          `; UTM/UPS grid relative:          ${formatValue(
            'utmGridRelative',
            false
          )}`
        )
        lines.push(
          `; preserve vert shot orientation: ${formatValue(
            'preserveVerticalShotOrientation',
            false
          )}`
        )
        lines.push(
          `; preserve vert shot length:      ${formatValue(
            'preserveVerticalShotLength',
            false
          )}`
        )
        lines.push(
          `; file is survey notes or other:  ${formatValue(
            'typeIsOther',
            false
          )}`
        )
        lines.push(
          `; launch action:                  ${formatValue(
            'launchAction',
            'properties'
          )}`
        )
        lines.push(
          `; default view after compilation: ${formatValue(
            'defaultViewAfterCompilation',
            'north or east'
          )}`
        )
        lines.push(
          `; process source svg if attached: ${formatValue(
            'processSourceSvgIfAttached',
            false
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
