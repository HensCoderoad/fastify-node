import config from 'config';
import IConfig from './config.interface';
const serverConfig: IConfig = require('config');
const envSchema = require("env-schema")
const schema = {
    type: 'object',
    properties: {
        client: {type: 'string'},
        connection: {
            port: {type: 'string', default: '5432'},
            host: {type: 'string', default: '127.0.0.1'},
            database: {type: 'string'},
            password: {type: 'string'},
            user: {type: 'string'},
            connection: {type: 'number'},
            requestTimeout: {type: 'number'}
        }
    }
}

const config = envSchema({
    schema: schema,
    data: serverConfig.get('knex'),
    dotenv: true
})


module.exports = {
    development: {
        charset: 'utf8',
        client: 'pg',
        pool: {
            min: 2,
            max: 10,
        },
        connection: config.connection
    },
    production: {
        charset: 'utf8',
        client: 'pg',
        pool: {
            min: 2,
            max: 10,
        },
        connection: config.connection
    },
}