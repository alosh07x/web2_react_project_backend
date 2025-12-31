const express = require("express");
const mysql = require("mysql");
const cors = require("cors");
const path = require("path"); // <--- Add this

const app = express();

app.use(express.json());
app.use(cors());

// 1. IMAGE CONFIGURATION
// This tells the server: "If someone asks for a file, look in the public folder"
app.use(express.static(path.join(__dirname, "public")));

const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "alosh07x", // <--- Don't forget your password
    database: "csci426_project"
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
            // SUCCESS: Send back the user's info (excluding password for safety)
            const user = data[0];
            const { password, ...otherDetails } = user; 
            return res.json({ message: "Login successful", user: otherDetails });
        } else {
            // FAIL
            return res.status(401).json({ message: "Wrong email or password" });
        }
    });
});


