const { describe } = require("node:test");
const { postDevice, getDevice } = require("../utils/route_generator");
const { v4 : uuidv4 } = require("uuid");
const { createDeviceBody } = require("../utils/body_generator");
const { createDevice } = require("../utils/object_generator");

describe("Device Routes", async ()=>{
    describe("POST /device", async () => {
        it("Returns 400 if deviceKey is not provided", async () => {
            const response = await postDevice({});

            expect(response.status).toBe(400);
            expect(response.body.code).toBe("SCHEMA_ERR");
        });
        it("Returns 400 if additional properties provided", async () => {
            const response = await postDevice({
                deviceKey: uuidv4(),
                other: "other"
            });

            expect(response.status).toBe(400);
            expect(response.body.code).toBe("SCHEMA_ERR");
        });
        it("Creates device on DB with right key and returns 201", async () => {
            const deviceKey = uuidv4();
            const body = createDeviceBody(deviceKey);

            let response = await postDevice(body);

            expect(response.status).toBe(201)
            expect(response.body.deviceKey).toBe(deviceKey);

            response = await getDevice(deviceKey);

            expect(response.status).toBe(200);
            expect(response.body.deviceKey).toBe(deviceKey);
        });
    });

    describe("GET /device/:deviceKey", async ()=>{
        it("Return 404 if device don't exist", async ()=>{
            await createDevice();
            const response = await getDevice(uuidv4());

            expect(response.status).toBe(404);
            expect(response.body.code).toBe("ERR00003");
        });
        it("Return 200 and right device", async ()=>{
            const { deviceKey } = await createDevice();
            
            const response = await getDevice(deviceKey);

            expect(response.status).toBe(200);
            expect(response.body.deviceKey).toBe(deviceKey);
        })
    })
})