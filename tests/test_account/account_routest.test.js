const exp = require('constants');
const { describe } = require('node:test');
const { v4: uuidv4 } = require("uuid");
const { postAccount, getAccount } = require("../utils/route_generator");
const { createAccountBody } = require("../utils/body_generator");
const { createAccount } = require("../utils/object_generator");
const { createSignedToken } = require('../utils/keycloak_mock');

describe('POST /account', async () => {
    test("Return 401 with malformated Token", async ()=>{
        const body = createAccountBody();
        const response = await postAccount(body, "lalala");

        expect(response.status).toBe(401)
        expect(response.body.code).toBe("JWT_ERROR");
    });
    test("Return 401 with expired token", async ()=>{
        const body = createAccountBody();
        const token = createSignedToken(uuidv4(), {expiresIn: "-1 days"})
        const response = await postAccount(body, token);

        expect(response.status).toBe(401)
        expect(response.body.code).toBe("EXPIRED_ERR");
    });
    test("Return 401 with token before nbf", async ()=>{
        const body = createAccountBody();
        const token = createSignedToken(uuidv4(), {notBefore: "1 days"})
        const response = await postAccount(body, token);

        expect(response.status).toBe(401)
        expect(response.body.code).toBe("NBF_ERR");
    });
    test("Return 201 on creation and return some json", async ()=>{
        const body = createAccountBody();
        const response = await postAccount(body);
    
        expect(response.status).toBe(201);
        expect(response.body).toBeDefined();
    });
    test("Create with accountKey equal token sub", async ()=>{
        const body = createAccountBody();
        const sub = uuidv4();
        const token = createSignedToken(sub);
        const response = await postAccount(body, token);
    
        expect(response.status).toBe(201);
        expect(response.body.accountKey).toBe(sub);
    });
    test("Create account and profile in DB", async () => {
        const account = await createAccount();
    
        let accountKey = account.accountKey;
        let mainProfileKey = account.profiles[0].profileKey;
        
        response = await getAccount(accountKey);
    
        expect(response.status).toBe(200);
        expect(response.body.accountKey).toBe(accountKey)
        expect(response.body.mainProfileKey).toBe(mainProfileKey);
    });
    test("Create account with mainProfileKey equal created profileKey", async () => {
        const account = await createAccount();
    
        let accountKey = account.accountKey;
        let profileKey = account.profiles[0].profileKey;
        
        response = await getAccount(accountKey);

        expect(response.body.mainProfileKey).toBe(profileKey);
    });
    test("Returns 400 when missing mainProfileName", async () => {
        const response = await postAccount({})
        expect(response.status).toBe(400);
        expect(response.body).toBeDefined();
        expect(response.body.code).toBe("SCHEMA_ERR");
    });
    test("Returns 400 if have additional properties", async () => {
        let response = await postAccount({
            mainProfileName: "name",
            other: "other"
        })

        expect(response.status).toBe(400);
        expect(response.body.code).toBe("SCHEMA_ERR")
    });
});
describe('GET /account/:accountKey', async () => {
    test("Returns 404 if account does not exists", async ()=>{
        let response = await getAccount(uuidv4());

        expect(response.status).toBe(404);
        expect(response.body.code).toBe("ERR00001")
    });
    if("Return 401 unauthorized with toke of other account", async ()=>{
        let account1 = await createAccount();
        let account2 = await createAccount();

        const token = createSignedToken(account1.accountKey);
        const response = getAccount(account2.accountKey, token);

        expect(response.status).toBe(401)
        expect(response.body.code).toBe("UNAUTHORIZED")
    })
    test("Returns 200 with the object if it exists", async () => {
        let account = await createAccount();
        
        const response = await getAccount(account.accountKey);

        expect(response.status).toBe(200);
        expect(response.body).toBeDefined();
        expect(response.body.accountKey).toBe(account.accountKey);
    })
    test("Returns all Profiles in the body", async () => {
        const account = await createAccount();
        
        response = await getAccount(account.accountKey);

        expect(response.status).toBe(200);
        expect(response.body.profiles[0]).toBeDefined();
    })
})
