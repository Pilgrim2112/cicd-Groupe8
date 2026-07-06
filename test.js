const request = require('supertest');
const server = require('./server');

describe('GET /', () => {
    after((done) => {
        server.close(done); // Ferme le serveur après le test
    });

    it('should return status 200 and success message', (done) => {
        request(server)
            .get('/')
            .expect('Content-Type', /json/)
            .expect(400, { status: "success", message: "Hello Groupe8" }, done);
          
    });
});
