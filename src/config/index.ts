import * as dotenv from 'dotenv'
dotenv.config()
import defaults from './default'
const config = require('./' + (process.env.NODE_ENV || 'production'))

type ConfigType = {
    db_url: string
    identity: string
    port: number
    log_level: string
    test_url: string
    test_username: string | undefined
    test_password: string | undefined
    uploads_dir: string
}

const final: ConfigType = { ...defaults, ...config }
export default final
