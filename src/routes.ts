import { FastifyInstance } from 'fastify';
import {authController} from './services/auth/auth.controller';

const routes = [authController];
/**注册路由 */
export const loadRoutes = (server: FastifyInstance) => {
  for (let i = 0; i < routes.length; i++) {
    server.register(routes[i]);
  }
};
