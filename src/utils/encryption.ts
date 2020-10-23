import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';
import IConfig from '../config/config.interface';
const serverConfig: IConfig = require('config');
const envSchema = require('env-schema')
const schema = {
    type: 'object',
    required: ['key'],
    properties: {
        key: {type: 'string'}
    }
};
const config = envSchema({
    schema: schema,
    data: serverConfig.get('encrypt'),
    dotenv: true
})

export class AESEncryption {
    private static readonly encryption_key: string = config.key; // must be 32 characters

    /**
     * Encrypt a value.
     * @param {string} text - The value to encrypt
     * @return {string} The encrypted value.
     */
    public static encrypt(text: string): string {
        console.log(this.encryption_key)
        const iv = randomBytes(16); // For AES
        const cipher = createCipheriv('aes-256-cbc', Buffer.from(this.encryption_key), iv);
        let encrypted = cipher.update(text);
        encrypted = Buffer.concat([encrypted, cipher.final()]);
        return iv.toString('hex') + ':' + encrypted.toString('hex');
    }
    /**
     * Decrypt a value.
     * @param {string} text - The value to decrypt
     * @return {string} The decrypted value.
     */
    public static decrypt(text: string): string {
        const textParts = text.split(':');
        // @ts-ignore
        const iv = Buffer.from(textParts.shift(), 'hex');
        const encryptedText = Buffer.from(textParts.join(':'), 'hex');
        const decipher = createDecipheriv('aes-256-cbc', Buffer.from(this.encryption_key), iv);
        let decrypted = decipher.update(encryptedText);
        decrypted = Buffer.concat([decrypted, decipher.final()]);
        return decrypted.toString();
    }
}
