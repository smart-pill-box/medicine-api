const exp = require('constants');
const { describe } = require('node:test');
let request = require('supertest');
const { v4: uuidv4 } = require("uuid");

request = request("http://localhost:8080");

describe("Account routes", async ()=>{
    describe('POST /account', async () => {
        it("Return 201 on creation and return some json", async ()=>{
            const response = await request.post('/account')
            .send({ mainProfileName: 'Test Profile' });
        
            expect(response.status).toBe(201);
            expect(response.body).toBeDefined();
        });
        it("Create account and profile in DB", async () => {
            let response = await request.post('/account')
                .send({ mainProfileName: 'Test Profile' });
        
            let accountKey = response.body.accountKey;
            let mainProfileKey = response.body.profiles[0].profileKey;
          
            response = await request.get(`/account/${accountKey}`);
        
            expect(response.status).toBe(200);
            expect(response.body.accountKey).toBe(accountKey)
            expect(response.body.mainProfileKey).toBe(mainProfileKey);
        });
        it("Create account with mainProfileKey equal created profileKey", async () => {
            let response = await request.post('/account')
                .send({ mainProfileName: 'Test Profile' });
        
            let accountKey = response.body.accountKey;
            let profileKey = response.body.profiles[0].profileKey;
          
            response = await request.get(`/account/${accountKey}`);

            expect(response.body.mainProfileKey).toBe(profileKey);
        });
        it("Returns 400 when missing mainProfileName", async () => {
            const response = await request.post('/account')
            .send({ });
            expect(response.status).toBe(400);
            expect(response.body).toBeDefined();
            expect(response.body.code).toBe("SCHEMA_ERR");
        });
        it("Returns 400 if have additional properties", async () => {
            let response = await request.post('/account')
                .send({ mainProfileName: 'Test Profile', other: "other" });

            expect(response.status).toBe(400);
            expect(response.body.code).toBe("SCHEMA_ERR")
        });
    });
    describe('GET /account/:accountKey', async () => {
        it("Returns 404 if account does not exists", async ()=>{
            let response = await request.get(`/account/${uuidv4()}`);
            expect(response.status).toBe(404);
            expect(response.body.code).toBe("ERR00001")
        });
        it("Returns 200 with the object if it exists", async () => {
            let response = await request.post('/account')
            .send({ mainProfileName: 'Test Profile' });
            const accountKey = response.body.accountKey;
            
            response = await request.get(`/account/${accountKey}`);

            expect(response.status).toBe(200);
            expect(response.body).toBeDefined();
            expect(response.body.accountKey).toBe(accountKey);
        })
        it("Returns all Profiles in the body", async () => {
            let response = await request.post('/account')
            .send({ mainProfileName: 'Test Profile' });
            const accountKey = response.body.accountKey;
            
            response = await request.get(`/account/${accountKey}`);

            expect(response.status).toBe(200);
            expect(response.body.profiles[0]).toBeDefined();
        })
    })
})

