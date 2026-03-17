import pkg from 'pg';
const { Pool } = pkg;

//Configuramos la conexión a la base de datos 

const db = new Pool({
    connectionString: process.env.DB_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

export default db