import mysql from "mysql2";
import { appConfig } from "../utils/appConfig";

const connection = mysql.createPool({
    host: appConfig.dbConfig.host,
    user: appConfig.dbConfig.user,
    password: appConfig.dbConfig.password,
    database: appConfig.dbConfig.database,
    port: appConfig.dbConfig.port
})


export default function runQuery(q: string, params: any[] = []): Promise<any> {
    return new Promise((resolve, reject) => {
        connection.query(q, params, (err, res) => {
            if (err) {
                reject(err);
                return;
            }
            resolve(res);
        });
    });
}


export const closeDB = async () =>{
    connection.end()
}