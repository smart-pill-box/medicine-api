const { describe } = require("node:test");
const { createDevice, createProfile, createAccount } = require("../utils/object_generator");
const { postProfileDevice, getProfile, getProfileDevices } = require("../utils/route_generator");
const { v4:uuidv4 } = require("uuid");
const { createProfileDeviceBody } = require("../utils/body_generator");

describe("Profile Device Routes", async ()=>{
    describe("POST /device/:deviceKey/profile_device", async ()=>{
        it("Returns 404 if device does not exist", async () => {
            await createDevice();
            const { accountKey } = await createAccount();
            const { profileKey } = await createProfile(accountKey);

            const body = createProfileDeviceBody(uuidv4())
            const response = await postProfileDevice(accountKey, profileKey, body);

            expect(response.status).toBe(404);
            expect(response.body.code).toBe("ERR00003");
        });

        it("Returns 404 if profile does not exist", async () => {
            const { deviceKey } = await createDevice();
            const { accountKey } = await createAccount();
            await createProfile(accountKey);

            const body = createProfileDeviceBody(deviceKey)
            const response = await postProfileDevice(accountKey, uuidv4(), body);

            expect(response.status).toBe(404);
            expect(response.body.code).toBe("ERR00002");
        });

        it("Returns 404 if profile is not from right account", async ()=> {
            const { deviceKey } = await createDevice();
            const { accountKey } = await createAccount();
            const { profileKey } = await createProfile(accountKey);

            const body = createProfileDeviceBody(deviceKey)
            const response = await postProfileDevice(uuidv4(), profileKey, body);

            expect(response.status).toBe(404);
            expect(response.body.code).toBe("ERR00002");
        });

        it("Returns 201 and create profileDevice on DB", async ()=>{
            const { deviceKey } = await createDevice();
            const { accountKey } = await createAccount();
            const { profileKey } = await createProfile(accountKey);

            const body = createProfileDeviceBody(deviceKey);
            let response = await postProfileDevice(accountKey, profileKey, body);

            expect(response.status).toBe(201);
            expect(response.body).toBeDefined();

            response = await getProfileDevices(accountKey, profileKey);

            expect(response.status).toBe(200);
            expect(response.body.data[0].deviceKey).toBe(deviceKey);
        });
    })
})