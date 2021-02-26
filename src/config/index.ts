import * as dotenv from 'dotenv'
dotenv.config()
import defaults from './default'
var config = require('./' + (process.env.NODE_ENV || 'production') + '.ts')

export default { ...defaults, ...config }
