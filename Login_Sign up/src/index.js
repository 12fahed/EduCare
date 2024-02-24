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

    const existingUser = await collection.findOne({ email: req.body.email });
    
    if (existingUser) {
        return res.send("User Already Exists");
    }

    const pass = req.body.password
    const confirm = req.body.confirm

    if(pass===confirm){
        const data = {
            email: req.body.email,
            password: await hashpass(req.body.password),
            role: req.body.dropdown,
            fname: req.body.fname,
            mname: req.body.mname,
            lname: req.body.lname,
            insti: req.body.insti,
            dob: req.body.dob,
            phno: req.body.phno
        }
    
        await collection.insertMany([data])
    
        res.send("Success")
    }
    else{
        res.send("Mistach Password")
    }
    
})


app.post("/login", async (req, res)=>{

    try{
        const check = await collection.findOne({email: req.body.email})
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