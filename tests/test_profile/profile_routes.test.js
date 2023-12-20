const { describe } = require("node:test");
const { v4:uuidv4 } = require("uuid");
const { createAccount, createProfile, createDevice, createProfileDevice, PillRoutineObjectGenerator, updatePillRoutine } = require("../utils/object_generator");
const { getProfile, postProfile, getAccount, getProfileDevices, getProfilePillRoutines } = require("../utils/route_generator");
const { createProfileBody } = require("../utils/body_generator");
const { createSignedToken } = require("../utils/keycloak_mock");
const { addDays } = require("date-fns");

describe("POST /account/:accountKey/profile", ()=>{
    test("Return 401 with malformated Token", async ()=>{
        const {accountKey} = await createAccount();
    
        const body = createProfileBody();
        const response = await postProfile(accountKey, body, "lalala");

        expect(response.status).toBe(401)
        expect(response.body.code).toBe("JWT_ERROR");
    });
    test("Return 401 with expired token", async ()=>{
        const {accountKey} = await createAccount();
    
        const token = createSignedToken(accountKey, {expiresIn: "-1 days"})
        const body = createProfileBody();
        const response = await postProfile(accountKey, body, token);

        expect(response.status).toBe(401)
        expect(response.body.code).toBe("EXPIRED_ERR");
    });
    test("Return 401 with token before nbf", async ()=>{
        const {accountKey} = await createAccount();
    
        const token = createSignedToken(accountKey, {notBefore: "1 days"})
        const body = createProfileBody();
        const response = await postProfile(accountKey, body, token);

        expect(response.status).toBe(401)
        expect(response.body.code).toBe("NBF_ERR");
    });
    test("Return 401 unauthorized with token of other account", async ()=>{
        let account1 = await createAccount();
        let account2 = await createAccount();

        const token = createSignedToken(account2.accountKey);
        const body = createProfileBody();
        const response = await postProfile(account1.accountKey, body, token);

        expect(response.status).toBe(401)
        expect(response.body.code).toBe("UNAUTHORIZED")
    });

    test("Return 404 if account does not exists", async ()=>{
        await createAccount();

        const body = createProfileBody();
        const response = await postProfile(uuidv4(), body);

        expect(response.status).toBe(404);
        expect(response.body.code).toBe("ERR00001");
    });

    test("Returns 400 if name is not provided", async ()=>{
        const account = await createAccount();
        
        const response = await postProfile(
            account.accountKey, {}
        );

        expect(response.status).toBe(400);
        expect(response.body.code).toBe("SCHEMA_ERR")
    });

    test("Returns 400 with additional properties", async ()=>{
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

    test("Return 201 and create on DB", async ()=>{
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

describe("GET /account/:accountKey/profile/:profileKey", ()=>{
    test("Return 404 if profile is of other account", async ()=>{
        const account1 = await createAccount();
        const account2 = await createAccount();

        const profile = await createProfile(account1.accountKey);

        const response = await getProfile(account2.accountKey, profile.profileKey);

        expect(response.status).toBe(404);
        expect(response.body.code).toBe("ERR00002");
    });

    test("Return 200 if profile exists", async ()=>{
        const account = await createAccount();
        const profile = await createProfile(account.accountKey);

        const response = await getProfile(account.accountKey, profile.profileKey);

        expect(response.status).toBe(200);
        expect(response.body.profileKey).toBe(profile.profileKey);
    });
});

describe("GET /account/:accountKey/profile/:profileKey/profile_devices", () => {
    test("Returns 404 if profile from wrong account", async ()=>{
        const account1 = await createAccount();
        const account2 = await createAccount();

        const profile = await createProfile(account1.accountKey);

        const response = await getProfileDevices(account2.accountKey, profile.profileKey);

        expect(response.status).toBe(404);
        expect(response.body.code).toBe("ERR00002");
    });
    test("Show only the devices the profile have", async ()=>{
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

describe("GET /account/:accountKey/profile/:profileKey/pill_routines", ()=>{
    test("Returns 404 if profile from wrong account", async ()=>{
        const account1 = await createAccount();
        const account2 = await createAccount();

        const profile = await createProfile(account1.accountKey);

        const response = await getProfilePillRoutines(account2.accountKey, profile.profileKey);

        expect(response.status).toBe(404);
        expect(response.body.code).toBe("ERR00002");
    });

    test("Returns only the pillRoutines of that profile", async ()=>{
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

    test("Return the versions of a pillRoutine", async ()=>{
        const { accountKey } = await createAccount();
        const { profileKey } = await createProfile(accountKey);

        const { pillRoutineKey } = await PillRoutineObjectGenerator.createDayPeriodPillRoutine(accountKey, profileKey)

        const tomorrow = addDays(new Date(), 1);
        await updatePillRoutine(accountKey, profileKey, pillRoutineKey, undefined, undefined, tomorrow.toISOString());

        let response = await getProfilePillRoutines(accountKey, profileKey);

        expect(response.status).toBe(200);
        expect(response.body.data.length).toBe(2);
    });
})