const request = require('request');
const host = process.env.host;
const serverUrl = `http://${host}:3000/messages`;

console.log('Server URL: ', serverUrl);

beforeAll(done => {
    console.log('Setting up test environment')

    let message = {
        name: 'user',
        message: 'hello from user'
    }

    let payload = {
        json: message
    }

    request.post(serverUrl, payload, (err, resp) => {
        if (err) {
            console.error('Environment setup failed', err.toString());
        } else {
            if (resp.statusCode == 200)
                console.log('Environment setup complete')
            else 
                console.error('Environment setup failed')
        }
            
    })
    done();
});

describe('get messages', () => {
    it('should return 200 ok', (done) => {
        request.get(serverUrl, (err, resp) => {
            expect(resp.statusCode).toEqual(200);
            done();
        });
    });

    it('should return a list, thats not empty', (done) => {
        request.get(serverUrl, (err, resp) => {
            expect(JSON.parse(resp.body).length).toBeGreaterThan(0);
            done();
        });
    });
});

describe('get messages from user', () => {
    let serverUrlUser = `${serverUrl}/user`;

    it('should return 200 ok', (done) => {
        request.get(serverUrlUser, (err, resp) => {
            expect(resp.statusCode).toEqual(200);
            done();
        });
    });

    it('name should be user', (done) => {
        request.get(serverUrlUser, (err, resp) => {
            expect(JSON.parse(resp.body).name).toEqual('user');
            done();
        });
    });
});