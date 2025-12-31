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
