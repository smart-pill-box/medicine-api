const { describe } = require("node:test");
const { v4:uuidv4 } = require("uuid");
const { createAccount, createProfile, createDevice, createProfileDevice, PillRoutineObjectGenerator } = require("../utils/object_generator");
const { getProfile, postProfile, getAccount, getProfileDevices, getProfilePillRoutines } = require("../utils/route_generator");
const { createProfileBody } = require("../utils/body_generator");

describe("Profile Routes", async ()=>{
    describe("POST /account/:accountKey/profile", async ()=>{
        it("Return 404 if account does not exists", async ()=>{
            await createAccount();

            const body = createProfileBody();
            const response = await postProfile(uuidv4(), body);

            expect(response.status).toBe(404);
            expect(response.body.code).toBe("ERR00001");
        });

        it("Returns 400 if name is not provided", async ()=>{
            const account = await createAccount();
            
            const response = await postProfile(
                account.accountKey, {}
            );

            expect(response.status).toBe(400);
            expect(response.body.code).toBe("SCHEMA_ERR")
        });

        it("Returns 400 with additional properties", async ()=>{
            const account = await createAccount();
            
            const response = await postProfile(
                account.accountKey, {
                    name: "name",
                    other: "other"
                }
            );

            expect(response.status).toBe(400);
            expect(response.body.code).toBe("SCHEMA_ERR")
        });

        it("Return 201 and create on DB", async ()=>{
            let account = await createAccount();

            const body = createProfileBody();
            let response = await postProfile(account.accountKey, body);

            expect(response.status).toBe(201);
            
            const profileKey = response.body.profileKey;

            response = await getProfile(account.accountKey, profileKey);

            expect(response.status).toBe(200);
            expect(response.body.profileKey).toBe(profileKey);
        });

        test("Update account profiles after creations", async ()=>{
            const account = await createAccount();
            const newProfile = await createProfile(account.accountKey);

            const response = await getAccount(account.accountKey);

            expect(response.status).toBe(200);
            expect(response.body.profiles.length).toBe(2);
        });
    });
    describe("GET /account/:accountKey/profile/:profileKey", async ()=>{
        it("Return 404 if profile is of other account", async ()=>{
            const account1 = await createAccount();
            const account2 = await createAccount();

            const profile = await createProfile(account1.accountKey);

            const response = await getProfile(account2.accountKey, profile.profileKey);

            expect(response.status).toBe(404);
            expect(response.body.code).toBe("ERR00002");
        });

        it("Return 200 if profile exists", async ()=>{
            const account = await createAccount();
            const profile = await createProfile(account.accountKey);

            const response = await getProfile(account.accountKey, profile.profileKey);

            expect(response.status).toBe(200);
            expect(response.body.profileKey).toBe(profile.profileKey);
        });
    });
    describe("GET /account/:accountKey/profile/:profileKey/profile_devices", async () => {
        it("Returns 404 if profile from wrong account", async ()=>{
            const account1 = await createAccount();
            const account2 = await createAccount();

            const profile = await createProfile(account1.accountKey);

            const response = await getProfileDevices(account2.accountKey, profile.profileKey);

            expect(response.status).toBe(404);
            expect(response.body.code).toBe("ERR00002");
        });
        it("Show only the devices the profile have", async ()=>{
            const { deviceKey } = await createDevice();

            const { accountKey } = await createAccount();
            const { profileKey } = await createProfile(accountKey);

            let response = await getProfileDevices(accountKey, profileKey);
            expect(response.status).toBe(200);
            expect(response.body.data.length).toBe(0);

            await createProfileDevice(accountKey, profileKey, deviceKey);

            response = await getProfileDevices(accountKey, profileKey);

            expect(response.status).toBe(200);
            expect(response.body.data.length).toBe(1);
            expect(response.body.data[0].deviceKey).toBe(deviceKey);

        });
    });

    describe("GET /account/:accountKey/profile/:profileKey/pill_routines", async ()=>{
        it("Returns 404 if profile from wrong account", async ()=>{
            const account1 = await createAccount();
            const account2 = await createAccount();

            const profile = await createProfile(account1.accountKey);

            const response = await getProfilePillRoutines(account2.accountKey, profile.profileKey);

            expect(response.status).toBe(404);
            expect(response.body.code).toBe("ERR00002");
        });

        it("Returns only the pillRoutines of that profile", async ()=>{
            const { accountKey } = await createAccount();

            const profile1 = await createProfile(accountKey);
            const profile2 = await createProfile(accountKey);

            await PillRoutineObjectGenerator.createDayPeriodPillRoutine(accountKey, profile1.profileKey)

            let response = await getProfilePillRoutines(accountKey, profile2.profileKey);

            expect(response.status).toBe(200);
            expect(response.body.data.length).toBe(0);

            response = await getProfilePillRoutines(accountKey, profile1.profileKey);

            expect(response.status).toBe(200);
            expect(response.body.data.length).toBe(1);
        });
    })

})