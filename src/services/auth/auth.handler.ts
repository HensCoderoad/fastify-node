import {AuthDto} from "./auth.dto";
import {AESEncryption} from "../../utils/encryption";
import IConfig from '../../config/config.interface';
const envSchema = require('env-schema')
const serverConfig: IConfig = require('config');
const jwt = require("jsonwebtoken");
const schema = {
    type: 'object',
    required: ['secret','expiresin'],
    properties: {
        secret: { type: 'string' },
        expiresin: {type: 'string'}
    }
};
const config = envSchema({
    schema: schema,
    data: serverConfig.get('jwt'),
    dotenv: true
});
export class AuthHandler {
    public static async generateAuthToken(authDto: AuthDto) {
        const userId = AESEncryption.encrypt(authDto.id.toString());
        return jwt.sign({
                email: authDto.email,
                userId: userId
            }, config.secret, {
                issuer: "wiredmartian",
                algorithm: "HS512",
                expiresIn: "2h"
            });
    }
    public static async Authorize(request, reply) {
        const authHeader = request.headers.authorization;
        try {
            if (!authHeader) {
                reply.send('Request missing auth token');
            }
            await request.jwtVerify()
            request.user["userId"] = parseInt(AESEncryption.decrypt(request.user['userId']));
        } catch (e) {
            reply.send(e.message);
        }
    }
}
