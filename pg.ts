import pkg from "pg"
import dotenv from "dotenv"

dotenv.config()

const { Pool } = pkg

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    connectionTimeoutMillis:6000
})

export default pool