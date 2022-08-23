const express = require("express")
const app = express()
const mysql = require("mysql")
const bodyParser = require("body-parser") 
const bycrypt = require("bcrypt")
const path = require("path")
const cookieSession = require("cookie-session")
require("dotenv").config()
const { send } = require("process")
const {DateTime} = require("luxon")

const authenticationMiddleWare = (req, res, next) =>{
	if(req.path == "/login" || req.path == "/signup") next()
	else if(req.session.hasOwnProperty("user_id")){
		
		next();
	}
	else{
		res.redirect("/login.html")
	}
}

app.use(cookieSession({
	name: 'session',
	keys: [process.env.SESSION_KEY],
	maxAge: 24 * 60 * 60 * 1000
	// maxage given in mill second
}))

app.set('view engine', 'ejs')
app.use(express.static("resources"))
app.use(bodyParser.urlencoded({extended: true}))
// app.use(authenticationMiddleWare)
app.use(express.static("private_resources"))

// mysql string connection syntax
const con = mysql.createConnection(process.env.MYSQL_CON_STRING)

con.connect((err)=>{
	if(err) console.log(err)
	else console.log("connected successfully to mysql")
})
app.post("/signup", (req, res)=>{
	bycrypt.hash(req.body.password, 10, (err, hashed_password)=> {
		if(err) console.log("err signup");

		con.query(`INSERT INTO Users (name, email, password) VALUES ('${req.body.full_name}', '${req.body.email}', '${hashed_password}')`, (err, result)=>{
		if(err) res.send("Error has occured");
		else res.send("Signed up successfully")
 		})
	})
})

app.post("/login", (req, res)=>{
	const email = req.body.email
	const text_password = req.body.password
	con.query(`SELECT id, name, password FROM Users WHERE email='${email}'`, (err, results)=>{
	
		if(err) res.sendStatus(200)
		
		else {
		const correct_password_hash = results[0].password
		bycrypt.compare( text_password, correct_password_hash, (err, comparison_result) =>{
			if(err) res.send("err logging in")

			if(comparison_result) { 
				req.session.user_id = results[0].id
				
				req.session.user_name = results[0]
				// res.send("You have been Logged in")
				res.redirect("/feed")
			}
			else res.sendStatus(401)
		})
		}
	})
})

app.get("/logout", authenticationMiddleWare, (req, res) => {
	req.session = null
	res.redirect("/login")
})

app.get("/myprofile", authenticationMiddleWare, (req, res) =>{
	res.render("myprofile.ejs", {
		name: req.session.user_name.name
	})
})

app.get("/feed", authenticationMiddleWare, (req, res)=> {
	res.render("feed.ejs", {
		name: req.session.user_name.name,
		user_id: req.session.user_id
	})
})

app.post("/post/new", authenticationMiddleWare, (req,res)=>{
	const content = req.body.content
	const session_id = req.session.user_id

	if(req.body.hasOwnProperty("content") && req.body.content != ""){
		con.query("INSERT INTO Posts (content, user_id) VALUES (?, ?)", [req.body.content, req.session.user_id], (err, post_result)=>{
		if(err)res.sendStatus(501)
		else res.sendStatus(201)
	})
	}
	else res.sendStatus(401)
})

app.get("/post/inciya", authenticationMiddleWare, (req,res) => {
	con.query(" SELECT Posts.id, Posts.content, Posts.date_posted, Users.name, Users.id AS user_id FROM Posts INNER JOIN Users ON Posts.user_id= Users.id", (err, result)=>{
		if(err) sendStatus(500)
		else{
			const final = result.map(post => {
				post.date_posted = DateTime.fromJSDate(post.date_posted).toFormat('dd LLL yyyy')
				// add .toFormat and read luxon doc to format it
				console.log(post.date_posted)
				return post
			});
			res.json(final)
			// 	res.json(result)
		}
	})
})

app.listen(3000, ()=>{
	console.log("server listening on port 3000")
})
