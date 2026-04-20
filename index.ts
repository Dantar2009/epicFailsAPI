import express from "express"
import cors from "cors"
import pg from "pg"
import dotenv from "dotenv"
import messagesRouter from "./Routers/messages.ts"
import usersRouter from "./Routers/users.ts"
import pool from "./pg.ts"
dotenv.config()

const app = express()




app.use(cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173"
}))
app.use(express.json())


        pool.query(`
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                name VARCHAR(100) UNIQUE NOT NULL,
                pass VARCHAR(255) NOT NULL,
                pick INTEGER DEFAULT NULL
            )
        `)
        console.log("✅ Таблица users создана")
        
        pool.query(`
            CREATE TABLE IF NOT EXISTS messages (
                id SERIAL PRIMARY KEY,
                sender VARCHAR(100) NOT NULL,
                text TEXT NOT NULL,
                rating INTEGER DEFAULT 0
            )
        `)
        console.log("✅ Таблица messages создана")
        
    

app.use("/users", usersRouter)
app.use("/messages", messagesRouter)



app.get("/test", (req, res) => {
    res.json({ ok: true })
})

const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
    console.log(`🚀 Сервер запущен на порту ${PORT}`)
})