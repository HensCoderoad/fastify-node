import Knex from "knex";
import IConfig from "../config/config.interface";
// export const db = Knex(db_connection["development"]);
export default class db {
    private connection: Knex;

    constructor(private kenxClient: any, private config: IConfig){
        this.connection = kenxClient(this.config['development'])
    }

    getConnection(): Knex {
        return this.connection;
    }

    async startTransaction(): Promise<Knex.Transaction> {
        return new Promise((resolve, reject) =>{
            this.connection.transaction(trx => resolve(trx)).catch(reject)
        })
    }
}
