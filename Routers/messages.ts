import { Router } from "express"
import pool from "../pg.js"

const messagesRouter = Router()

messagesRouter.get("/getMessages", async(req, res) => {
    try{
        const data= await pool.query("SELECT * FROM messages ")
        console.log(data.rows)
        res.json({otvet:data.rows})

    }catch(err){
        console.log(err)
    }
})



messagesRouter.post("/setMessage", async(req, res) => {
    try {
        console.log("Сообщение получено")
        const { name, pass, text } = req.body
        
        if(!name || !pass) {
            return res.json({ otvet: "regPlease" })
        }
        if(!text) {
            return res.json({ otvet: "noText" })
        }
        
        const data = await pool.query(
            "SELECT * FROM users WHERE name = $1 AND pass = $2",
            [name, pass]
        )
        
        if(data.rows.length < 1) {
            return res.json({ otvet: "regPlease" })
        }
        
        await pool.query(
            "INSERT INTO messages (sender, text) VALUES ($1, $2)",
            [name, text]
        )
        
        const messages = await pool.query("SELECT * FROM messages ")
        res.json({ otvet: "OK", messages: messages.rows })  // ✅ добавляем "OK"
        
    } catch(err) {
        console.log(err)
        res.status(500).json({ otvet: "Ошибка сервера" })
    }
})
messagesRouter.post("/deleteMessage",async(req,res)=>{
    const {name,pass,index}=req.body
    if(!name || !pass) {
        return res.json({ otvet: "regPlease" })
    }
    const data = await pool.query(
        "SELECT * FROM users WHERE name = $1 AND pass = $2",
        [name, pass]
    )
        
    if(data.rows.length < 1) {
        return res.json({ otvet: "regPlease" })
    }
    await pool.query("DELETE  FROM messages WHERE id=$1",[index])
    const messages = await pool.query("SELECT * FROM messages ")
    res.json({ otvet: "OK", messages: messages.rows })  
})

messagesRouter.post("/voteMessage", async(req, res) => {
    try {
        const { name, pass, vote } = req.body
        console.log(name,pass,vote)
        if(!name || !pass) {
            return res.json({ otvet: "regPlease" })
        }
        
        const data = await pool.query(
            "SELECT * FROM users WHERE name = $1 AND pass = $2",
            [name, pass]
        )
        
        if(data.rows.length < 1) {
            return res.json({ otvet: "regPlease" })
        }
        
        const oldPickUser = await pool.query(
            "SELECT * FROM users WHERE name = $1",
            [name]
        )
        const oldPick = oldPickUser.rows[0].pick
        
        if (oldPick === vote) {
            await pool.query("UPDATE users SET pick = NULL WHERE name = $1", [name])
            await pool.query("UPDATE messages SET rating = rating - 1 WHERE id = $1", [vote])
            const upd = await pool.query("SELECT * FROM users WHERE name = $1", [name])
            const messages = await pool.query("SELECT * FROM messages")
            return res.json({ 
                otvet: "cancelled", 
                user: {id:upd.rows[0].id, name: upd.rows[0].name, pass: upd.rows[0].pass, pick: upd.rows[0].pick },
                messages: messages.rows
            })
        }
        
        if (oldPick !== null) {
            await pool.query("UPDATE messages SET rating = rating - 1 WHERE id = $1", [oldPick])
        }
        
        await pool.query("UPDATE users SET pick = $1 WHERE name = $2", [vote, name])
        await pool.query("UPDATE messages SET rating = rating + 1 WHERE id = $1", [vote])
        
        const upd = await pool.query("SELECT * FROM users WHERE name = $1", [name])
        const messages = await pool.query("SELECT * FROM messages ORDER BY rating DESC")
        
        res.json({ 
            otvet: "OK", 
            user: { id:upd.rows[0].id, name: upd.rows[0].name, pass: upd.rows[0].pass, pick: upd.rows[0].pick },
            messages: messages.rows
        })
        
    } catch(err) {
        console.log(err)
        res.status(500).json({ otvet: "Ошибка сервера" })
    }
})



export default messagesRouter