const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const bodyParser = require("body-parser");

const app = express();
app.use(bodyParser.json());

const db = new sqlite3.Database(':memory:');

db.serialize(() => {
    db.run('DROP TABLE IF EXISTS vender');
    db.run('CREATE TABLE vender (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, location TEXT, storeID INTEGER)', () => {
        db.run('INSERT INTO vender (name, location, storeID) VALUES (?, ?, ?)', ['Brocks Bananas', 'Seattle, WA', '123456789']);
    });
});

app.post('/vender', (req, res) => {
    const { name, location, storeID } = req.body;
    if (!name || !location || !storeID) {
        return res.status(400).json({ error: "Please provide name, location, and storeID" });
    }
    db.run('INSERT INTO vender (name, location, storeID) VALUES (?, ?, ?)', [name, location, storeID], function (err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({ id: this.lastID });
    });
});

app.get('/vender', (req, res) => {
    db.all('SELECT * FROM vender', [], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({ vender: rows });
    });
});

app.get('/vender/:id', (req, res) => {
    const { id } = req.params;
    db.get('SELECT * FROM vender WHERE id = ?', [id], (err, row) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({ vender: row });
    });
});

app.put('/vender/:id', (req, res) => {
    const { id } = req.params;
    const { name, location, storeID } = req.body;
    db.run('UPDATE vender SET name = ?, location = ?, storeID = ? WHERE id = ?', [name, location, storeID, id], function (err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({ changedRows: this.changes });
    });
});

app.delete('/vender/:id', (req, res) => {
    const { id } = req.params;
    db.run('DELETE FROM vender WHERE id = ?', [id], function (err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({ deletedRows: this.changes });
    });
});

module.exports = app;
