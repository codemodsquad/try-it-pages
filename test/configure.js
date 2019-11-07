/* eslint-disable */

require('@babel/register')({ extensions: ['.js', '.jsx', '.ts', '.tsx'] })

const { configure } = require('enzyme')
const Adapter = require('enzyme-adapter-react-16')
configure({ adapter: new Adapter() })

if (process.argv.indexOf('--watch') >= 0) {
  before(() => process.stdout.write('\u001b[2J\u001b[1;1H\u001b[3J'))
}
