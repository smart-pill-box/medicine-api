const { createAccountBody, createProfileBody } =  require("./body_generator");
const { postAccount, postProfile } =  require("./route_generator");


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

module.exports = {
    createAccount,
    createProfile
}