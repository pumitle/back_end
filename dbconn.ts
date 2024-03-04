import mysql from 'mysql';

export const conn = mysql.createPool(
    {
        connectionLimit: 10,
        host:"sql6.freemysqlhosting.net",
        user:"sql6688665",
        password:"cFYiar1Rzt",
        database:"sql6688665"
    }
);