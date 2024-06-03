const request = require('supertest');
const express = require('express');
const cors = require('cors');
const app = require('express');

// describe('testing our ROUTES', () => {
//     test()
// });

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
          expect(res.body.users[0]).to.include({ name: 'Test User', email: 'test@example.com' });
          done();
        });
    });
});