const request = require('supertest');
const server = require('../server');

describe('Venders', () => {
    beforeAll((done) => {
        // Add any setup required before tests run
        done();
    });

    it('should list ALL venders on /vender GET', async () => {
        const res = await request(server).get('/vender');
        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('vendors');
        expect(Array.isArray(res.body.vendors)).toBe(true);
    });

    it('should add a SINGLE vender on /vender POST', async () => {
        const res = await request(server)
            .post('/vender')
            .send({ name: 'Fresh Fruits', location: 'Los Angeles, CA', storeID: 'storeID987' });
        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('id');
    });

    it('should list a SINGLE vender on /vender/:id GET', async () => {
        const res = await request(server).get('/vender/1');
        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('vendor');
        expect(res.body.vendor).toHaveProperty('id');
    });

    it('should update a SINGLE vender on /vender/:id PUT', async () => {
        const res = await request(server)
            .put('/vender/1')
            .send({ name: 'Organic Fruits', location: 'San Diego, CA', storeID: 'storeID654' });
        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('changedRows');
    });

    it('should delete a SINGLE vender on /vender/:id DELETE', async () => {
        const res = await request(server).delete('/vender/1');
        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('deletedRows');
    });
});
