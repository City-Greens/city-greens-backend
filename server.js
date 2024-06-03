const cors = require("cors");
const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const bodyParser = require("body-parser");
const app = express();
const port = 4242;
app.use(cors());

// sqlite mid ware here
app.use(bodyParser.json());

const db = new sqlite3.Database(':memory:');

db.serialize(() =>{
    db.run('Create Table users (id Integer primary key autoincrement, name text, email text)')
});
// Create a new user
// curl -X POST http://localhost:4242/users -H "Content-Type: application/json" -d '{"name":"John Doe","email":"john@example.com","storeID":"accountID"}'

app.post('/users', (req, res) => {
    const { name, email, storeID } = req.body;
    db.run('INSERT INTO users (name, email) VALUES (?, ?)', [name, email, storeID], function (err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json({ id: this.lastID });
    });
  });
  
  // Get all users
  // curl http://localhost:4242/users

  app.get('/users', (req, res) => {
    db.all('SELECT * FROM users', [], (err, rows) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json({ users: rows });
    });
  });
  
  // Get a single user by ID
  // curl http://localhost:4242/users/1

  app.get('/users/:id', (req, res) => {
    const { id } = req.params;
    db.get('SELECT * FROM users WHERE id = ?', [id], (err, row) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json({ user: row });
    });
  });
  
  // Update a user by ID
  // curl -X PUT http://localhost:4242/users/1 -H "Content-Type: application/json" -d '{"name":"Jane Doe","email":"jane@example.com"}'

  app.put('/users/:id', (req, res) => {
    const { id } = req.params;
    const { name, email } = req.body;
    db.run('UPDATE users SET name = ?, email = ? WHERE id = ?', [name, email, id], function (err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json({ changedRows: this.changes });
    });
  });
  
  // Delete a user by ID
  // curl -X DELETE http://localhost:4242/users/1

  app.delete('/users/:id', (req, res) => {
    const { id } = req.params;
    db.run('DELETE FROM users WHERE id = ?', [id], function (err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json({ deletedRows: this.changes });
    });
  });
  
const stripe = require("stripe")(
  // This is your test secret API key.
  "sk_test_51PNQggKVH5eLCsVpBp7cYHZSEif0JLfzFGSVlELXnMTWrnZLpoTN4UBBZRWNLJQujcA6AsRL2SYqkkDoohZyGpMf00sGpJZdzK",
  {
    apiVersion: "2023-10-16",
  },
);

app.use(express.static("dist"));
app.use(express.json());

app.post("/account_link", async (req, res) => {
  console.log("req.body", req.body);
  try {
    const { account } = req.body;

    const accountLink = await stripe.accountLinks.create({
      account: account,
      return_url: `${req.headers.origin}/return/${account}`,
      refresh_url: `${req.headers.origin}/refresh/${account}`,
      type: "account_onboarding",
    });

    res.json(accountLink);
  } catch (error) {
    console.error(
      "An error occurred when calling the Stripe API to create an account link:",
      error,
    );
    res.status(500);
    res.send({ error: error.message });
  }
});

app.post("/account", async (req, res) => {
  try {
    const account = await stripe.accounts.create({});

    res.json({
      account: account.id,
    });
  } catch (error) {
    console.error(
      "An error occurred when calling the Stripe API to create an account",
      error,
    );
    res.status(500);
    res.send({ error: error.message });
  }
});

app.get("/*", (_req, res) => {
  res.sendFile(__dirname + "/dist/index.html");
});

app.listen(port, () =>
  console.log(
    "Node server listening on port 4242! Visit http://localhost:4242 in your browser.",
  ),
);
