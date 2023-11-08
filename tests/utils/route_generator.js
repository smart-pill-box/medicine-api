let request = require('supertest');
request = request("http://localhost:8080");

async function postAccount(body){
    const response = await request.post('/account').send(body);

    return response;
};

async function getAccount(accountKey){
    const response = await request.get(`/account/${accountKey}`);

    return response;
};

async function postProfile(accountKey, body){
    const response = await request.post(`/account/${accountKey}/profile`).send(body);

    return response;
};

async function getProfile(accountKey, profileKey){
    const response = await request.get(`/account/${accountKey}/profile/${profileKey}`);

    return response;
};

module.exports = {
    postAccount,
    getAccount,
    postProfile,
    getProfile
}