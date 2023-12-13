const { describe } = require("node:test");
const { createAccount, createProfile, PillRoutineObjectGenerator, updatePillStatus } = require("../utils/object_generator");
const { createUpdatePillBody } = require("../utils/body_generator");
const { putPillStatus, getModifiedPills } = require("../utils/route_generator");
const { createSignedToken } = require("../utils/keycloak_mock");

describe("Modified pill routes", async ()=>{
    describe("GET /account/:accountKey/profile/:profileKey/pill_routine/:pillRoutineKey/modified_pills", async ()=>{
        it("Return 401 with malformated Token", async ()=>{
            const { accountKey } = await createAccount();
            const { profileKey } = await createProfile(accountKey);
            const { pillRoutineKey } = await PillRoutineObjectGenerator.createDayPeriodPillRoutine(
                accountKey, profileKey, 2, ["12:00"]
            )
            const today = new Date();
            const pillDatetime = new Date(
                today.getFullYear(), 
                today.getMonth(), 
                today.getDate(), 
                12, 
                0
            );
            updatePillStatus(accountKey, profileKey, pillRoutineKey, "manualyConfirmed", pillDatetime.toISOString());

            const response = await getModifiedPills(accountKey, profileKey, pillRoutineKey, "lalala")

            expect(response.status).toBe(401)
            expect(response.body.code).toBe("JWT_ERROR");
        });

        it("Return 401 with expired token", async ()=>{
            const { accountKey } = await createAccount();
            const { profileKey } = await createProfile(accountKey);
            const { pillRoutineKey } = await PillRoutineObjectGenerator.createDayPeriodPillRoutine(
                accountKey, profileKey, 2, ["12:00"]
            )
            const today = new Date();
            const pillDatetime = new Date(
                today.getFullYear(), 
                today.getMonth(), 
                today.getDate(), 
                12, 
                0
            );
            updatePillStatus(accountKey, profileKey, pillRoutineKey, "manualyConfirmed", pillDatetime.toISOString());

            const token = createSignedToken(accountKey, {expiresIn: "-1 days"})
            const response = await getModifiedPills(accountKey, profileKey, pillRoutineKey, token)

            expect(response.status).toBe(401)
            expect(response.body.code).toBe("EXPIRED_ERR");
        });

        it("Return 401 with token before nbf", async ()=>{
            const { accountKey } = await createAccount();
            const { profileKey } = await createProfile(accountKey);
            const { pillRoutineKey } = await PillRoutineObjectGenerator.createDayPeriodPillRoutine(
                accountKey, profileKey, 2, ["12:00"]
            )
            const today = new Date();
            const pillDatetime = new Date(
                today.getFullYear(), 
                today.getMonth(), 
                today.getDate(), 
                12, 
                0
            );
            updatePillStatus(accountKey, profileKey, pillRoutineKey, "manualyConfirmed", pillDatetime.toISOString());

            const token = createSignedToken(accountKey, {notBefore: "1 days"})
            const response = await getModifiedPills(accountKey, profileKey, pillRoutineKey, token)

            expect(response.status).toBe(401)
            expect(response.body.code).toBe("NBF_ERR");
        });

        it("Return 401 unauthorized with token of other account", async ()=>{
            const account1 = await createAccount();
            const account2 = await createAccount();

            const { profileKey } = await createProfile(account1.accountKey);
            const { pillRoutineKey } = await PillRoutineObjectGenerator.createDayPeriodPillRoutine(
                account1.accountKey, profileKey, 2, ["12:00"]
            )
            const today = new Date();
            const pillDatetime = new Date(
                today.getFullYear(), 
                today.getMonth(), 
                today.getDate(), 
                12, 
                0
            );
            updatePillStatus(account1.accountKey, profileKey, pillRoutineKey, "manualyConfirmed", pillDatetime.toISOString());

            const token = createSignedToken(account2.accountKey)
            const response = await getModifiedPills(account1.accountKey, profileKey, pillRoutineKey, token)

            expect(response.status).toBe(401)
            expect(response.body.code).toBe("UNAUTHORIZED");
        });

        it("Return 404 if profile is from other account", async ()=>{
            const account1 = await createAccount();
            const account2 = await createAccount();

            const { profileKey } = await createProfile(account1.accountKey);
            const { pillRoutineKey } = await PillRoutineObjectGenerator.createDayPeriodPillRoutine(
                account1.accountKey, profileKey, 2, ["12:00"]
            )
            const today = new Date();
            const pillDatetime = new Date(
                today.getFullYear(), 
                today.getMonth(), 
                today.getDate(), 
                12,
                0
            );
            updatePillStatus(
                account1.accountKey, profileKey, pillRoutineKey, "manualyConfirmed", pillDatetime.toISOString()
            );
            const response = await getModifiedPills(account2.accountKey, profileKey, pillRoutineKey)

            expect(response.status).toBe(404)
            expect(response.body.code).toBe("ERR00009");
        });

        it("Return 404 if pill_routine is from other profile", async ()=>{
            const { accountKey } = await createAccount();

            const profile1 = await createProfile(accountKey);
            const profile2 = await createProfile(accountKey);
            const { pillRoutineKey } = await PillRoutineObjectGenerator.createDayPeriodPillRoutine(
                accountKey, profile1.profileKey, 2, ["12:00"]
            )
            const today = new Date();
            const pillDatetime = new Date(
                today.getFullYear(), 
                today.getMonth(), 
                today.getDate(), 
                12,
                0
            );
            updatePillStatus(
                accountKey, profile1.profileKey, pillRoutineKey, "manualyConfirmed", pillDatetime.toISOString()
            );

            const response = await getModifiedPills(accountKey, profile2.profileKey, pillRoutineKey)

            expect(response.status).toBe(404)
            expect(response.body.code).toBe("ERR00009");
        });

        it("Return only the modified pills of that pillRoutine", async ()=>{
            const { accountKey } = await createAccount();

            const { profileKey } = await createProfile(accountKey);
            const pillRoutine1 = await PillRoutineObjectGenerator.createDayPeriodPillRoutine(
                accountKey, profileKey, 2, ["12:00"]
            );
            const pillRoutine2 = await PillRoutineObjectGenerator.createDayPeriodPillRoutine(
                accountKey, profileKey, 2, ["12:00"]
            );
            const today = new Date();
            const pillDatetime = new Date(
                today.getFullYear(), 
                today.getMonth(), 
                today.getDate(), 
                12,
                0
            );

            updatePillStatus(
                accountKey, 
                profileKey, 
                pillRoutine2.pillRoutineKey, 
                "manualyConfirmed", 
                pillDatetime.toISOString()
            );

            let response = await getModifiedPills(accountKey, profileKey, pillRoutine1.pillRoutineKey)

            expect(response.status).toBe(200)
            expect(response.body.data.length).toBe(0);

            response = await getModifiedPills(accountKey, profileKey, pillRoutine2.pillRoutineKey)

            expect(response.status).toBe(200)
            expect(response.body.data.length).toBe(1);
        });
    })
})