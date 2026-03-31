const mysql = require("mysql2");
const session = require("express-session");
const express = require("express");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = 3000;

//  (MySQL connection)
const db = mysql.createConnection({
  host: "mysql",
  user: "root",
  password: "root",
  database: "coffee_db"
});

db.connect((err) => {
  if (err) {
    console.log("❌ Database connection failed:", err);
  } else {
    console.log("✅ Connected to MySQL");
  }
});

app.use(session({
  secret: "coffee-secret-key",
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false }
}));


app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

/* ---------- PAGE ROUTES ---------- */

app.get("/", (req, res) =>
  res.sendFile(path.join(__dirname, "views", "index.html"))
);

app.get("/menu", (req, res) =>
  res.sendFile(path.join(__dirname, "views", "menu.html"))
);

app.get("/about", (req, res) =>
  res.sendFile(path.join(__dirname, "views", "about.html"))
);

app.get("/contact", (req, res) =>
  res.sendFile(path.join(__dirname, "views", "contact.html"))
);

app.get("/login", (req, res) =>
  res.sendFile(path.join(__dirname, "views", "login.html"))
);

app.get("/admin", (req, res) => {

  if (!req.session.user || req.session.user.role !== "admin") {
    return res.send("Access denied");
  }

  res.sendFile(path.join(__dirname, "views", "admin.html"));
});


/* ---------- API ROUTES ---------- */

// GET MENU DATA
app.get("/api/menu", (req, res) => {
  const data = fs.readFileSync("./data/menu.json");
  res.json(JSON.parse(data));
});

//Get signup data

app.get("/signup", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "signup.html"));
});


//Login data

app.get("/api/me", (req, res) => {
  if (!req.session.user) return res.json({ loggedIn: false });
  res.json({ loggedIn: true, user: req.session.user });
});


// CONTACT FORM
app.post("/api/contact", (req, res) => {
  const { name, email, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({
      success: false,
      message: "All fields required"
    });
  }

  const filePath = path.join(__dirname, "data", "messages.json");

  let messages = [];

  if (fs.existsSync(filePath)) {
    messages = JSON.parse(fs.readFileSync(filePath));
  }

  const newMsg = {
    id: Date.now(),
    name,
    email,
    message,
    time: new Date().toISOString()
  };

  messages.push(newMsg);

  fs.writeFileSync(filePath, JSON.stringify(messages, null, 2));

  console.log("📩 New contact message:", name);

  res.json({
    success: true,
    message: "Message saved successfully"
  });
});


// LOGIN
app.post("/api/login", (req, res) => {
  const { email, password } = req.body;

  const file = path.join(__dirname, "data", "users.json");
  const users = fs.existsSync(file)
    ? JSON.parse(fs.readFileSync(file))
    : [];

  const user = users.find(
    u => u.email === email && u.password === password
  );

  if (!user) {
    return res.json({ success: false, message: "Invalid credentials" });
  }

  // ⭐ CREATE SESSION
  req.session.user = {
    id: user.id,
    name: user.name,
    role: user.role
  };

  res.json({ success: true, name: user.name, role: user.role });
});



//signup page
app.post("/api/signup", (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({
      success: false,
      message: "All fields required"
    });
  }

  const file = path.join(__dirname, "data", "users.json");
  let users = fs.existsSync(file)
    ? JSON.parse(fs.readFileSync(file))
    : [];

  if (users.find(u => u.email === email)) {
    return res.json({
      success: false,
      message: "User already exists"
    });
  }

  const newUser = {
    id: Date.now(),
    name,
    email,
    password,   // ⚠️ later we hash — ok for now
    role: "user"
  };

  users.push(newUser);
  fs.writeFileSync(file, JSON.stringify(users, null, 2));

  console.log("👤 New signup:", email);

  res.json({
    success: true,
    message: "Signup successful"
  });
});


//order page
app.post("/api/order", (req, res) => {

  // 🔒 user must be logged in
  if (!req.session.user) {
    return res.status(401).json({
      success: false,
      message: "Login required to place order"
    });
  }

  const { items, total } = req.body;

  const file = path.join(__dirname, "data", "orders.json");

  let orders = fs.existsSync(file)
    ? JSON.parse(fs.readFileSync(file))
    : [];

  const newOrder = {
    id: Date.now(),
    userId: req.session.user.id,
    userName: req.session.user.name,
    items,
    total,
    time: new Date().toLocaleString()
  };

  orders.push(newOrder);
  fs.writeFileSync(file, JSON.stringify(orders, null, 2));

  console.log("🛒 Order by:", req.session.user.name);

  res.json({
    success: true,
    message: "Order placed successfully"
  });
});


//Logout
app.get("/api/logout", (req, res) => {
  req.session.destroy(() => {
    res.json({ success: true });
  });
});


/* ---------- START ---------- */

app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
