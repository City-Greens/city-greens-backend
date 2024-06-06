const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const bodyParser = require("body-parser");

const app = express();
app.use(bodyParser.json());

const db = new sqlite3.Database(':memory:');

db.serialize(() => {
    db.run('DROP TABLE IF EXISTS buyers'); // Drop the table if it exists to start fresh
    db.run('CREATE TABLE buyers (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, email TEXT, storeID TEXT)', () => {
        db.run('INSERT INTO buyers (name, email, storeID) VALUES (?, ?, ?)', ['John Doe', 'john@example.com', 'accountID']);
    });
});

// Create a new buyer
app.post('/buyers', (req, res) => {
    const { name, email, storeID } = req.body;
    if (!name || !email || !storeID) {
        return res.status(400).json({ error: "Please provide name, email, and storeID" });
    }
    db.run('INSERT INTO buyers (name, email, storeID) VALUES (?, ?, ?)', [name, email, storeID], function (err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({ id: this.lastID });
    });
});

app.get('/buyers', (req, res) => {
    db.all('SELECT * FROM buyers', [], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({ buyers: rows });
    });
});

app.get('/buyers/:id', (req, res) => {
    const { id } = req.params;
    db.get('SELECT * FROM buyers WHERE id = ?', [id], (err, row) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({ buyer: row });
    });
});

app.put('/buyers/:id', (req, res) => {
    const { id } = req.params;
    const { name, email, storeID } = req.body;
    db.run('UPDATE buyers SET name = ?, email = ?, storeID = ? WHERE id = ?', [name, email, storeID, id], function (err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({ changedRows: this.changes });
    });
});

app.delete('/buyers/:id', (req, res) => {
    const { id } = req.params;
    db.run('DELETE FROM buyers WHERE id = ?', [id], function (err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({ deletedRows: this.changes });
    });
});

module.exports = { app, db };