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

async function getDevice(deviceKey){
    const response = await request.get(`/device/${deviceKey}`);

    return response;
};

async function postDevice(body){
    const response = await request.post("/device").send(body);

    return response
};

async function postProfileDevice(accountKey, profileKey, body){
    const response = await request.post(
        `/account/${accountKey}/profile/${profileKey}/profile_device`
    ).send(body);

    return response;
};

async function getProfileDevices(accountKey, profileKey){
    const response = await request.get(
        `/account/${accountKey}/profile/${profileKey}/profile_devices`
    )

    return response
};

async function postPillRoutine(accountKey, profileKey, body){
    const response = await request.post(
        `/account/${accountKey}/profile/${profileKey}/pill_routine`
    ).send(body);

    return response;
};

async function getProfilePillRoutines(accountKey, profileKey){
    const response = await request.get(
        `/account/${accountKey}/profile/${profileKey}/pill_routines`
    );

    return response;
};

module.exports = {
    postAccount,
    getAccount,
    postProfile,
    getProfile,
    getProfileDevices,
    getDevice,
    postDevice,
    postProfileDevice,
    postPillRoutine,
    getProfilePillRoutines,
}