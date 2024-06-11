// const { Pool }= require("pg");
 
// const pool = new Pool()
 
// module.exports = {
//     query: (text, params) => pool.query(text, params),
// };

// const { Client } = require('pg');

// const client = new Client();

// module.exports = {
//     connect: async () => {
//         try {
//             await client.connect();
//             console.log('Connected to PostgreSQL database');
//         } catch (error) {
//             console.error('Error connecting to PostgreSQL database:', error);
//         }
//     },
//     query: (text, params) => client.query(text, params),
//     end: async () => {
//         try {
//             await client.end();
//             console.log('Connection to PostgreSQL database closed');
//         } catch (error) {
//             console.error('Error closing connection to PostgreSQL database:', error);
//         }
//     }
// };

// const { Pool } = require('pg');

// const pool = new Pool();

// module.exports = {
//     query: async (text, params) => {
//         try {
//             const result = await pool.query(text, params);
//             return result;
//         } catch (error) {
//             console.error('Error executing query:', error);
//             throw error;
//         }
//     },
//     connect: async () => {
//         try {
//             await pool.connect();
//             console.log('Connected to PostgreSQL database');
//         } catch (error) {
//             console.error('Error connecting to PostgreSQL database:', error);
//         }
//     },
//     end: async () => {
//         try {
//             await pool.end();
//             console.log('Connection to PostgreSQL database closed');
//         } catch (error) {
//             console.error('Error closing connection to PostgreSQL database:', error);
//         }
//     }
// };

const { Pool } = require("pg");

const pool = new Pool();

module.exports = {
    pool,
    connect: async () => {
        try {
            const client = await pool.connect();
            return client;
        } catch (error) {
            console.error('Error connecting to the database:', error);
            throw error;
        }
    },
    query: async (text, params) => {
        try {
            const client = await pool.connect();
            const result = await client.query(text, params);
            client.release();
            return result;
        } catch (error) {
            console.error('Error executing query:', error);
            throw error;
        }
    }
};
