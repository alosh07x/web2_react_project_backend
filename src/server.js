const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const path = require("path");
const jwt = require("jsonwebtoken");

const app = express();
app.use(express.json());
app.use(cors());

// for images
app.use('/images', express.static(path.join(__dirname, 'public', 'images')));

// Database Connection
const db = mysql.createConnection({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "alosh07x",
    database: process.env.DB_NAME || "csci426_project",
    port: process.env.DB_PORT || 3306,
    ssl: { rejectUnauthorized: false }
});

db.connect((err) => {
    if(err) console.log(err);
    else console.log("Connected to DB");
});

// --- Routes ---

app.post("/login", (req, res) => {
    const sql = "SELECT * FROM users WHERE email = ? AND password = ?";
    
    db.query(sql, [req.body.email, req.body.password], (err, data) => {
        if(err) return res.status(500).json({ message: "Error logging in" });
        
        if(data.length > 0) {
            const user = data[0];
            const { password, ...otherDetails } = user; 

            // CHANGED: Increased expiration to 24 hours so you don't get kicked out while testing
            const token = jwt.sign({ id: user.id, email: user.email }, "jwtSecretKey", { expiresIn: "24h" });

            return res.json({ message: "Login successful", user: otherDetails, token: token });
        } else {
            return res.status(401).json({ message: "Wrong email or password" });
        }
    });
});

app.post("/contact", (req, res) => {
    const token = req.headers['authorization'];

    if (!token) {
        return res.status(401).json({ message: "Not Authenticated. Please login." });
    }

    jwt.verify(token, "jwtSecretKey", (err, userInfo) => {
        if (err) {
            // DEBUG: Log the specific error to your Render logs (Expired vs Invalid)
            console.log("Token Verification Error:", err.message); 
            return res.status(403).json({ message: "Token is not valid!" });
        }

        const insertSql = "INSERT INTO messages (`email`, `subject`, `message`) VALUES (?)";
        const values = [userInfo.email, req.body.subject, req.body.message];

        db.query(insertSql, [values], (err, result) => {
            if (err) return res.status(500).json(err);
            return res.status(201).json({ message: "Message sent successfully" });
        });
    });
});

app.post("/register", (req, res) => {
    const sql = "INSERT INTO users (`name`, `email`, `password`) VALUES (?)";
    const values = [req.body.username, req.body.email, req.body.password];
    db.query(sql, [values], (err, data) => {
        if(err) return res.status(500).json({ message: "Error registering user" });
        return res.json({ message: "User registered successfully" });
    });
});

app.get("/products", (req, res) => {
    const sql = "SELECT * FROM products";
    db.query(sql, (err, data) => {
        if(err) return res.json(err);
        return res.json(data);
    });
});

app.listen(8081, () => {
    console.log("Listening...");
});


