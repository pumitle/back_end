import mysql from 'mysql';
import util from 'util';

export const conn = mysql.createPool(
    {
        connectionLimit: 10,
        host:"202.28.34.197",
        user:"web66_65011212026",
        password:"65011212026@csmsu",
        database:"web66_65011212026"
    }
);

export const queryAsync = util.promisify(conn.query).bind(conn);