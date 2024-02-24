const express = require("express")
const app = express()
const path = require("path")
const hbs = require("hbs")
const collection = require("./mongodb")
const jwt = require("jsonwebtoken")
const cookieParser = require("cookie-parser")
const bcryptjs = require("bcryptjs")
const { constants } = require("buffer")

const tempelatePath = path.join(__dirname, '../tempelates')

app.use(express.json())
app.use(cookieParser())
app.set("view engine", "hbs")
app.set("views", tempelatePath)
app.use(express.urlencoded({extended: false}))

async function hashpass(password){

    const res = await bcryptjs.hash(password, 10)
    return res
}

async function compare(userPass, hashPass){

    const res = await bcryptjs.compare(userPass, hashPass)
    return res
}

app.get("/", (req, res)=>{
    res.render("login")
})

app.get("/signup", (req, res)=>{
    res.render("signup")
})

app.post("/signup", async (req, res)=>{
    const data = {
        name: req.body.name,
        password: await hashpass(req.body.password),
        role: req.body.dropdown
    }

    await collection.insertMany([data])

    res.render("home")
})



app.post("/login", async (req, res)=>{

    try{
        const check = await collection.findOne({name: req.body.name})
        const role = await collection.findOne({role: req.body.dropdown})
        const passCheck = await compare(req.body.password, check.password)
        

        if( ( check && passCheck ) && role){
            
            res.render("home")
        }
        else{
            res.send("Wrong Password")
        } 
    }
    catch{
        res.send("Wrong Details")
    }
    
})

app.listen(3000, () =>{
    console.log("Port Connected");
})