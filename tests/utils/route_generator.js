let request = require('supertest');
const { createSignedToken, createJwkExpectation } = require('./keycloak_mock');
const { v4: uuidv4 } = require("uuid");
const { clearMock } = require('./mock');
request = request("http://localhost:8080");

async function postAccount(body, authorization=null){
    await createJwkExpectation()
    if (!authorization){
        authorization = createSignedToken(uuidv4())
    }

    const response = await request.post('/account').set("authorization", authorization).send(body);

    return response;
};

async function getAccount(accountKey, authorization=null){
    await createJwkExpectation()
    if (!authorization){
        authorization = createSignedToken(accountKey)
    }

    const response = await request.get(`/account/${accountKey}`).set("authorization", authorization);

    return response;
};

async function postProfile(accountKey, body, authorization=null){
    await createJwkExpectation()
    if (!authorization){
        authorization = createSignedToken(accountKey)
    }

    const response = await request.post(`/account/${accountKey}/profile`).set("authorization", authorization).send(body);

    return response;
};

async function getProfile(accountKey, profileKey, authorization=null){
    await createJwkExpectation()
    if (!authorization){
        authorization = createSignedToken(accountKey)
    }

    const response = await request.get(`/account/${accountKey}/profile/${profileKey}`).set("authorization", authorization);

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

async function getProfileDevices(accountKey, profileKey, authorization=null){
    await createJwkExpectation()
    if (!authorization){
        authorization = createSignedToken(accountKey)
    }

    const response = await request.get(
        `/account/${accountKey}/profile/${profileKey}/profile_devices`
    ).set("authorization", authorization)

    return response
};

async function postPillRoutine(accountKey, profileKey, body, authorization=null){
    await createJwkExpectation()
    if (!authorization){
        authorization = createSignedToken(accountKey)
    }

    const response = await request.post(
        `/account/${accountKey}/profile/${profileKey}/pill_routine`
    ).set("authorization", authorization).send(body);

    return response;
};

async function getProfilePillRoutines(accountKey, profileKey, authorization=null){
    await createJwkExpectation()
    if (!authorization){
        authorization = createSignedToken(accountKey)
    }

    const response = await request.get(
        `/account/${accountKey}/profile/${profileKey}/pill_routines`
    ).set("authorization", authorization);

    return response;
};

async function postModifiedPill(accountKey, profileKey, pillRoutineKey, body, authorization=null){
    await createJwkExpectation()
    if (!authorization){
        authorization = createSignedToken(accountKey)
    }

    const response = await request.post(
        `/account/${accountKey}/profile/${profileKey}/pill_routine/${pillRoutineKey}/modified_pill`
    ).set("authorization", authorization).send(body);

    return response;
};

async function getModifiedPills(accountKey, profileKey, pillRoutineKey, authorization=null){
    await createJwkExpectation()
    if (!authorization){
        authorization = createSignedToken(accountKey)
    }

    const response = await request.get(
        `/account/${accountKey}/profile/${profileKey}/pill_routine/${pillRoutineKey}/modified_pills`
    ).set("authorization", authorization)

    return response;
};

async function getProfilePills(accountKey, profileKey, queryParams, authorization=null){
    await createJwkExpectation()
    if (!authorization){
        authorization = createSignedToken(accountKey)
    }

    const response = await request.get(
        `/account/${accountKey}/profile/${profileKey}/pills`
    ).set("authorization", authorization).query(queryParams);

    return response;
}

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
    postModifiedPill,
    getModifiedPills,
    getProfilePills,
}