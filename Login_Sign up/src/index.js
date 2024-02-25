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
        const fname =  req.body.fname
        const email = req.body.email
        const insti = req.body.insti
        
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
    
        //NODEMAILER STARTS

        function create_random_string(string_length){
            var random_String ="";
            var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789abcdefghijklmnopqrstuvwxyz'
            for(var i =0; i< string_length; i++){
                random_String += characters.charAt(Math.floor(Math.random() *characters.length))
            }
            return random_String
        }

        var key = create_random_string(10);

        var html=`Hello ${fname}, You are receiving this email as an acknowledgement that you have created an Institute Account with name ${insti}, your key is ${key}`

        var nodemailer = require('nodemailer');

        var transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'educare.notification@gmail.com',
            pass: 'hjtofjqmlgaeswqq'
        }
        });

        var mailOptions = {
        from: 'educare.notification@gmail.com',
        to: email,
        subject: 'Welcome to EduCare',
        text: 'Hello and Welcome to Educare, your key',
        html: html
        };

        transporter.sendMail(mailOptions, function(error, info){
        if (error) {
            console.log(error);
        } else {
            console.log('Email sent: ' + info.response);
        }
        });
        console.log(email)
        //NODEMAILER ENDS

        res.render("midlogin", { fname: req.body.fname , email: req.body.email, insti: req.body.insti});
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
            
            const username = await collection.findOne({email: "fahedpc12092004@gmail.com"}, {fname: 1})
            console.log(username)

            res.render("midlogin", { fname: check.fname,  email: check.email, insti: check.insti});
        
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