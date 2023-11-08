const exp = require('constants');
const { describe } = require('node:test');
const { v4: uuidv4 } = require("uuid");
const { postAccount, getAccount } = require("../utils/route_generator");
const { createAccountBody } = require("../utils/body_generator");
const { createAccount } = require("../utils/object_generator");

describe("Account routes", async ()=>{
    describe('POST /account', async () => {
        it("Return 201 on creation and return some json", async ()=>{
            const body = createAccountBody();
            const response = await postAccount(body);
        
            expect(response.status).toBe(201);
            expect(response.body).toBeDefined();
        });
        it("Create account and profile in DB", async () => {
            const account = await createAccount();
        
            let accountKey = account.accountKey;
            let mainProfileKey = account.profiles[0].profileKey;
          
            response = await getAccount(accountKey);
        
            expect(response.status).toBe(200);
            expect(response.body.accountKey).toBe(accountKey)
            expect(response.body.mainProfileKey).toBe(mainProfileKey);
        });
        it("Create account with mainProfileKey equal created profileKey", async () => {
            const account = await createAccount();
        
            let accountKey = account.accountKey;
            let profileKey = account.profiles[0].profileKey;
          
            response = await getAccount(accountKey);

            expect(response.body.mainProfileKey).toBe(profileKey);
        });
        it("Returns 400 when missing mainProfileName", async () => {
            const response = await postAccount({})
            expect(response.status).toBe(400);
            expect(response.body).toBeDefined();
            expect(response.body.code).toBe("SCHEMA_ERR");
        });
        it("Returns 400 if have additional properties", async () => {
            let response = await postAccount({
                mainProfileName: "name",
                other: "other"
            })

            expect(response.status).toBe(400);
            expect(response.body.code).toBe("SCHEMA_ERR")
        });
    });
    describe('GET /account/:accountKey', async () => {
        it("Returns 404 if account does not exists", async ()=>{
            let response = await getAccount(uuidv4());

            expect(response.status).toBe(404);
            expect(response.body.code).toBe("ERR00001")
        });
        it("Returns 200 with the object if it exists", async () => {
            let account = await createAccount();
            
            const response = await getAccount(account.accountKey);

            expect(response.status).toBe(200);
            expect(response.body).toBeDefined();
            expect(response.body.accountKey).toBe(account.accountKey);
        })
        it("Returns all Profiles in the body", async () => {
            const account = await createAccount();
            
            response = await getAccount(account.accountKey);

            expect(response.status).toBe(200);
            expect(response.body.profiles[0]).toBeDefined();
        })
    })
})

