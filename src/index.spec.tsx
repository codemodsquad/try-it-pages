/* eslint-env mocha */

import * as React from 'react'
import { mount } from 'enzyme'
import { expect } from 'chai'

import Hello from './index'

describe('test setup', () => {
  it('works', () => {
    const comp = mount(<Hello />)
    expect(comp.text()).to.equal('Hello world!')
  })
})
