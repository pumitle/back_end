import mysql from 'mysql';

export const conn = mysql.createPool(
    {
        connectionLimit: 10,
        host:"sql6.freemysqlhosting.net",
        user:"sql6686892",
        password:"Ri3rhjlqu5",
        database:"sql6686892"
    }
);