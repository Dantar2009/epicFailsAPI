import { Router } from "express"
import bcrypt from "bcrypt"
import pool from "../pg.ts"







const usersRouter = Router()
usersRouter.get("/getUsers", async(req, res) => {
    try {
        const data = await pool.query("SELECT * FROM users")  
        res.json({ otvet: data.rows })
    } catch(err) {
        res.status(500).json({ otvet: "Ошибка сервера" })
    }
})
usersRouter.post("/register", async(req, res) => { 
    try {
        let { name, pass }: { name: string, pass: string } = req.body
        
        if(name.trim().length < 4){
            return res.json({ otvet: "shortName" })
        }
        
        const user = await pool.query(
            "SELECT * FROM users WHERE name = $1", 
            [name]
        )
        if (user.rows.length > 0) {
            return res.json({ otvet: "userRegistered" })
        }
        if(pass.length < 8){
            return res.json({ otvet: "shortPass" })
        }
        pass = await bcrypt.hash(pass, 10)
        const result = await pool.query(
            "INSERT INTO users (name, pass) VALUES ($1, $2) RETURNING *",
            [name, pass]
        )
        res.json({ otvet: "OK", user:{
            id: result.rows[0].id,
            name: result.rows[0].name,
            pass: result.rows[0].pass,
            pick: result.rows[0].pick
        }})
    } catch(err) {
        res.status(500).json({ otvet: "Ошибка сервера" })
    }
})
usersRouter.post("/signin", async(req, res) => {
    try {
        const { name, pass }: { name: string, pass: string } = req.body
        
        const user = await pool.query(
            "SELECT * FROM users WHERE name = $1",
            [name]
        )
        
        if (user.rows.length === 0) {
            return res.json({ otvet: "notFound" })
        }
        
        const validPass = await bcrypt.compare(pass, user.rows[0].pass)
        
        if (!validPass) {
            return res.json({ otvet: "wrongPass" })
        }
        
        res.json({ 
            otvet: "OK", 
            user: {
                id: user.rows[0].id,
                name: user.rows[0].name,
                pass:user.rows[0].pass,
                pick: user.rows[0].pick
            }
        })
        
    } catch(err) {
        res.status(500).json({ otvet: "Ошибка сервера" })
    }
})

export default usersRouter