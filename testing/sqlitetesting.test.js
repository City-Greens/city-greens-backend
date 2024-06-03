const request = require('supertest');
const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const { expect } = require('chai');

const app = express();
app.use(bodyParser.json());

// In-memory SQLite database for testing
const db = new sqlite3.Database(':memory:');
app.locals.db = db;

db.serialize(() => {
  db.run('CREATE TABLE users (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, email TEXT)', () => {
    db.run('INSERT INTO users (name, email) VALUES (?, ?)', ['Test User', 'test@example.com']);
  });
});

// Users route
app.get('/users', (req, res) => {
  db.all('SELECT * FROM users', [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ users: rows });
  });
});

describe('GET /users', () => {
  it('should return a list of users', (done) => {
    request(app)
      .get('/users')
      .expect('Content-Type', /json/)
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);
        expect(res.body).to.have.property('users');
        expect(res.body.users).to.be.an('array');
        expect(res.body.users.length).to.be.greaterThan(0);
        expect(res.body.users[0]).to.include({ name: 'Test User', email: 'test@example.com', storeID: 'storeID' });
        done();
      });
  });
});
