const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const bodyParser = require("body-parser");

const app = express();
app.use(bodyParser.json());

const db = new sqlite3.Database(':memory:');

db.serialize(() => {
    db.run('DROP TABLE IF EXISTS vender');
    // table has KEY, name, location, CREATE products table for products, amount, price, storeID 
    db.run('CREATE TABLE vender (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, location TEXT, products TEXT, amount INTEGER, price INTEGER, storeID INTEGER)', () => {
        db.run('INSERT INTO vender (name, location, products, amount, price, storeID) VALUES (?, ?, ?, ?, ?, ?)', ['Brocks Bananas','Seattle,WA', 'Bananas', '12', '2.99','123456789' ]);
    });
});

app.post('/vender', (req, res) => {
    const { name, email, storeID } = req.body;
    if (!name || !email || !storeID) {
        return res.status(400).json({ error: "Please provide name, email, and storeID" });
    }
    db.run('INSERT INTO vender (name, location, products, amount, price, storeID) VALUES (?, ?, ?, ?, ?, ?)', [name, location, products, amount, price, storeID ], function (err) {
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
        res.json({ seller: row });
    });
});

app.put('/vender/:id', (req, res) => {
    const { id } = req.params;
    const { name, email, storeID } = req.body;
    db.run('UPDATE vender SET name = ?, email = ?, storeID = ? WHERE id = ?', [name, email, storeID, id], function (err) {
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
