const { createAccountBody, createProfileBody, createDeviceBody, createProfileDeviceBody } =  require("./body_generator");
const { postAccount, postProfile, postDevice, postProfileDevice } =  require("./route_generator");


async function createAccount(mainProfileName=null){
    const body = createAccountBody(mainProfileName);
    const response = await postAccount(body);

    expect(response.status).toBe(201);

    return response.body;
};

async function createProfile(accountKey, name=null){
    const body = createProfileBody(accountKey, name);
    const response = await postProfile(accountKey, body);

    expect(response.status).toBe(201)

    return response.body;
};

async function createDevice(deviceKey=null){
    const body = createDeviceBody(deviceKey);
    const response = await postDevice(body);

    expect(response.status).toBe(201);

    return response.body;
};

async function createProfileDevice(accountKey, profileKey, deviceKey){
    const body = createProfileDeviceBody(deviceKey);
    const response = await postProfileDevice(accountKey, profileKey, body);

    expect(response.status).toBe(201);

    return response.body;
}

module.exports = {
    createAccount,
    createProfile,
    createDevice,
    createProfileDevice
}