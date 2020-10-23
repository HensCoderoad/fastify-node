import Fastify, { FastifyInstance } from 'fastify';
import { Server, IncomingMessage, ServerResponse } from 'http';
import Helmet from 'fastify-helmet';
import CORS from 'fastify-cors';
import fs from 'fs';
import { loadRoutes } from './routes';
import { ErrorHandler } from './handler/error'
import IConfig from './config/config.interface';

const envSchema = require('env-schema')
const serverConfig: IConfig = require('config');

const server: FastifyInstance<Server, IncomingMessage, ServerResponse> = Fastify({
    logger: true,
    ignoreTrailingSlash: true,
    maxParamLength: 200,
    bodyLimit: 6291456
})

const schema = {
    type: 'object',
    required: ['secret', 'expiresin'],
    properties: {
        expiresin: { type: 'string', default: '3h' },
        secret: { type: 'string'}
    }
};

const config = envSchema({
    schema: schema,
    data: serverConfig.get('jwt'),
    dotenv: true
});
/**加载路由 */
loadRoutes(server);

server.register(require('fastify-jwt'), { secret: config.secret });

server.register(CORS, {
    origin: ['http://localhost:8080'],
    methods: ['GET', 'POST', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,

})

server.register(require('fastify-redis'),{
    
})

server.setErrorHandler(ErrorHandler)

export default server;