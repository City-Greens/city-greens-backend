const request = require('supertest');
const server = require('../server');

describe('Buyers', () => {
    beforeAll((done) => {
        // Add any setup required before tests run
        done();
    });

    it('should list ALL buyers on /buyers GET', async () => {
        const res = await request(server).get('/buyers');
        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('buyers');
        expect(Array.isArray(res.body.buyers)).toBe(true);
    });

    it('should add a SINGLE buyer on /buyers POST', async () => {
        const res = await request(server)
            .post('/buyers')
            .send({ name: 'Jane Doe', email: 'jane@example.com', storeID: 'storeID123' });
        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('id');
    });

    it('should list a SINGLE buyer on /buyers/:id GET', async () => {
        const res = await request(server).get('/buyers/1');
        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('buyer');
        expect(res.body.buyer).toHaveProperty('id');
    });

    it('should update a SINGLE buyer on /buyers/:id PUT', async () => {
        const res = await request(server)
            .put('/buyers/1')
            .send({ name: 'Jane Smith', email: 'jane.smith@example.com', storeID: 'storeID1234' });
        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('changedRows');
    });

    it('should delete a SINGLE buyer on /buyers/:id DELETE', async () => {
        const res = await request(server).delete('/buyers/1');
        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('deletedRows');
    });
});
