const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const path = require("path");

const app = express();

app.use(express.json());
app.use(cors());

app.use(express.static(path.join(__dirname, "public/images")));

const db = mysql.createConnection({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "alosh07x",
    database: process.env.DB_NAME || "csci426_project",
    port: process.env.DB_PORT || 3306,

    ssl: {
      rejectUnauthorized: false
  }
});

db.connect((err) => {
    if(err) console.log(err);
    else console.log("Connected to DB");
});

//get all products
app.get("/products", (req, res) => {
    const sql = "SELECT * FROM products";
    db.query(sql, (err, data) => {
        if(err) return res.json(err);
        return res.json(data);
    });
});

//register user
app.post("/register", (req, res) => {
    const sql = "INSERT INTO users (`name`, `email`, `password`) VALUES (?)";
    
    const values = [
        req.body.username, 
        req.body.email,
        req.body.password
    ];
    
    db.query(sql, [values], (err, data) => {
        if(err) {
            console.error(err);
            return res.status(500).json({ message: "Error registering user" });
        }
        return res.json({ message: "User registered successfully" });
    });
});

//login user
app.post("/login", (req, res) => {
    const sql = "SELECT * FROM users WHERE email = ? AND password = ?";
    
    db.query(sql, [req.body.email, req.body.password], (err, data) => {
        if(err) return res.status(500).json({ message: "Error logging in" });
        
        if(data.length > 0) {
            
            const user = data[0];
            const { password, ...otherDetails } = user; 
            return res.json({ message: "Login successful", user: otherDetails });
        } else {
          
            return res.status(401).json({ message: "Wrong email or password" });
        }
    });
});

//send message
app.post("/contact", (req, res) => {
    const email = req.body.email;
    const subject = req.body.subject;
    const message = req.body.message;

    
    const checkUserSql = "SELECT * FROM users WHERE email = ?";
    
    db.query(checkUserSql, [email], (err, data) => {
        if (err) return res.status(500).json(err);
        
       
        if (data.length === 0) {
            return res.status(401).json({ message: "Access Denied: You must be a registered user." });
        }

        
        const insertSql = "INSERT INTO messages (`email`, `subject`, `message`) VALUES (?)";
        const values = [email, subject, message];

        db.query(insertSql, [values], (err, result) => {
            if (err) return res.status(500).json(err);
            return res.status(201).json({ message: "Message sent successfully" });
        });
    });
});

app.listen(8081, () => {
    console.log("Listening...");
});


