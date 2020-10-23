// import fastifyPlugin, {nextCallback, PluginOptions} from "fastify-plugin";
import {FastifyInstance, FastifyReply, FastifyRequest} from "fastify";
import {AuthHandler} from "./auth.handler";
import {UserHandler} from "../user/user.handler";
import {IUser, IResetPassword} from "../user/user.dto";
import {IncomingMessage, ServerResponse} from "http";
import {AuthDto} from "./auth.dto";
const fastifyPlugin = require('fastify-plugin')
export const authController = fastifyPlugin(async (server, options, next) => {
    server.route({
        method: "POST",
        url: "/api/v1/auth/register",
        schema: UserHandler.createUserSchema.schema,
        handler: async (request, reply) => {
            const user = {...request.body} as IUser;
            try {
                const res = await UserHandler.createUser(user);
                if (res && res.length > 0) {
                    const authDto: AuthDto = {
                        email: res[0].email,
                        id: res[0].id
                    };
                    const token = await AuthHandler.generateAuthToken(authDto);
                    return reply.send({ success: true, message: 'user created!', token: token });
                }
                /** needs an appropriate message here */
                return reply.send({ success: false, message: 'Failed to create a user'});
            } catch (e) {
                return reply.send(e);
            }
        }
    });
    server.route({
        method: "POST",
        url: "/api/v1/auth/token",
        schema: UserHandler.loginUserSchema.schema,
        preHandler: async (request, reply) => {
            try {
                const user = await UserHandler.loginUser({...request.body});
                if (!user.success && user.error) {
                    return reply.send(user.error);
                }
                request.user = user;
            } catch (e) {
                console.log(e)
                return reply.send(e);
            }
        },
        handler: async (request, reply) => {
            try {
                const user = request.user as any;
                const authDto: AuthDto = {
                    email: user.email,
                    id: user.id
                };
                const token = await AuthHandler.generateAuthToken(authDto);
                return reply.send({ token });
            } catch (e) {
                return reply.forbidden(e);
            }
        }
    });
    server.route({
        method: "PATCH",
        url: "/api/v1/auth/reset-password",
        schema: UserHandler.resetPasswordSchema.schema,
        preValidation: [AuthHandler.Authorize],
        handler: async (request, reply) => {
            try {
                const { email } = request.user as any; // hate this
                const model = { emailAddress: email, ...request.body } as IResetPassword;
                const result = await UserHandler.resetPassword(model);
                if (result) {
                    return reply.send({ success: true, message: "Password changed"});
                }
                return reply.send({ success: false, message: "Failed to change password"});
            } catch (e) {
                return reply.badRequest(e);
            }
        }
    });
    server.route({
        method: "GET",
        url: "/api/v1/auth-ping",
        schema: {
            tags: ['Authentication']
        },
        preValidation: [AuthHandler.Authorize],
        handler: async (request, reply) => {
            return reply.send({ authenticated: true })
        }
    });
    next();
});
