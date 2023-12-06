const { describe } = require("node:test");
const { createAccount, createProfile, PillRoutineObjectGenerator, createModifiedPill } = require("../utils/object_generator");
const { createModifiedPillBody } = require("../utils/body_generator");
const { postModifiedPill, getModifiedPills } = require("../utils/route_generator");
const { createSignedToken } = require("../utils/keycloak_mock");

describe("Modified pill routes", async ()=>{
    describe("POST /account/:accountKey/profile/:profileKey/pill_routine/:pillRoutineKey/modified_pill", async ()=>{
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
            )

            const body = createModifiedPillBody("manualyConfirmed", pillDatetime.toISOString());
            const response = await postModifiedPill(accountKey, profileKey, pillRoutineKey, body, "lalala")

            console.log(response.body);
            console.log(pillDatetime.toISOString());

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
            )
        
            const token = createSignedToken(accountKey, {expiresIn: "-1 days"})
            const body = createModifiedPillBody("manualyConfirmed", pillDatetime.toISOString());
            const response = await postModifiedPill(accountKey, profileKey, pillRoutineKey, body, token)

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
            )

            const token = createSignedToken(accountKey, {notBefore: "1 days"})
            const body = createModifiedPillBody("manualyConfirmed", pillDatetime.toISOString());
            const response = await postModifiedPill(accountKey, profileKey, pillRoutineKey, body, token)

            expect(response.status).toBe(401)
            expect(response.body.code).toBe("NBF_ERR");
        });

        if("Return 401 unauthorized with token of other account", async ()=>{
            let account1 = await createAccount();
            let account2 = await createAccount();
            const {profileKey} = await createProfile(account1.accountKey);
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
            )

            const token = createSignedToken(account2.accountKey);
            const body = createModifiedPillBody("manualyConfirmed", pillDatetime.toISOString());
            const response = await postModifiedPill(account1.accountKey, profileKey, pillRoutineKey, body, token)

            expect(response.status).toBe(401)
            expect(response.body.code).toBe("UNAUTHORIZED")
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
            )

            const body = createModifiedPillBody("manualyConfirmed", pillDatetime.toISOString());
            const response = await postModifiedPill(account2.accountKey, profileKey, pillRoutineKey, body)

            expect(response.status).toBe(404);
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
            )

            const body = createModifiedPillBody("manualyConfirmed", pillDatetime.toISOString());
            const response = await postModifiedPill(accountKey, profile2.profileKey, pillRoutineKey, body)

            expect(response.status).toBe(404);
            expect(response.body.code).toBe("ERR00009");
        });

        it("Return 404 if status does not exist", async ()=>{
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
            )

            const body = createModifiedPillBody("dont_exist", pillDatetime.toISOString());
            const response = await postModifiedPill(accountKey, profileKey, pillRoutineKey, body)

            expect(response.status).toBe(404);
            expect(response.body.code).toBe("ERR00006");
        });

        it("Return 400 when missing properties", async ()=>{
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
            )

            const body = createModifiedPillBody("manualyConfirmed", pillDatetime.toISOString());
            delete body["status"]
            const response = await postModifiedPill(accountKey, profileKey, pillRoutineKey, body)

            expect(response.status).toBe(400);
            expect(response.body.code).toBe("SCHEMA_ERR");
        });

        it("Return 400 with additionalProperties", async ()=>{
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
            )

            const body = createModifiedPillBody("manualyConfirmed", pillDatetime.toISOString());
            body["additional"] = "seila"
            const response = await postModifiedPill(accountKey, profileKey, pillRoutineKey, body)

            expect(response.status).toBe(400);
            expect(response.body.code).toBe("SCHEMA_ERR");
        });

        it("Return 400 if seconds in datetime is not 00", async ()=>{
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
                0,
                30
            )

            const body = createModifiedPillBody("manualyConfirmed", pillDatetime.toISOString());
            const response = await postModifiedPill(accountKey, profileKey, pillRoutineKey, body)

            expect(response.status).toBe(400);
            expect(response.body.code).toBe("SCHEMA_ERR");
        });

        it("Return 400 if miliseconds in datetime is not 00", async ()=>{
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
                0,
                0,
                300
            )

            const body = createModifiedPillBody("manualyConfirmed", pillDatetime.toISOString());
            const response = await postModifiedPill(accountKey, profileKey, pillRoutineKey, body)

            expect(response.status).toBe(400);
            expect(response.body.code).toBe("SCHEMA_ERR");
        });

        it("Return 400 if datetime is not valid", async ()=>{
            const { accountKey } = await createAccount();
            const { profileKey } = await createProfile(accountKey);
            const { pillRoutineKey } = await PillRoutineObjectGenerator.createDayPeriodPillRoutine(
                accountKey, profileKey, 2, ["13:00"]
            )
            const today = new Date();
            const pillDatetime = new Date(
                today.getFullYear(),
                today.getMonth(), 
                today.getDate(), 
                13, 
                0,
            )

            let datetimeStr = pillDatetime.toISOString();
            datetimeStr = datetimeStr.slice(0,5) + "13" + datetimeStr.slice(7)
            const body = createModifiedPillBody("manualyConfirmed", datetimeStr);
            const response = await postModifiedPill(accountKey, profileKey, pillRoutineKey, body)
            console.log(datetimeStr);

            expect(response.status).toBe(400);
            expect(response.body.code).toBe("ERR00007");
        });

        it("Return 400 if datetime does not exist on this routine", async ()=>{
            const { accountKey } = await createAccount();
            const { profileKey } = await createProfile(accountKey);
            const { pillRoutineKey } = await PillRoutineObjectGenerator.createDayPeriodPillRoutine(
                accountKey, profileKey, 2, ["12:00"]
            )
            const today = new Date();
            const wrongPillDatetime = new Date(
                today.getFullYear(),
                today.getMonth(), 
                today.getDate(), 
                13,
                0,
            )

            const body = createModifiedPillBody("manualyConfirmed", wrongPillDatetime.toISOString());
            const response = await postModifiedPill(accountKey, profileKey, pillRoutineKey, body)

            expect(response.status).toBe(400);
            expect(response.body.code).toBe("ERR00008");
        });

        it("Create on database on success and create status_event", async ()=>{
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
                0,
            )
            console.log(pillDatetime.getTimezoneOffset())

            const body = createModifiedPillBody("manualyConfirmed", pillDatetime.toISOString());
            console.log(body);
            let response = await postModifiedPill(accountKey, profileKey, pillRoutineKey, body)

            console.log(response.body);

            expect(response.status).toBe(201);
            expect(response.body.status).toBe("manualyConfirmed");

            response = await getModifiedPills(accountKey, profileKey, pillRoutineKey);

            console.log(response.body);
            expect(response.status).toBe(200);
            expect(response.body.data.length).toBe(1);
            expect(response.body.data[0].status).toBe("manualyConfirmed");
            expect(response.body.data[0].statusEvents.length).toBe(1);
            expect(response.body.data[0].statusEvents[0].status).toBe("manualyConfirmed");
        });

        it("Create with right quantity with dayPeriod", async ()=>{
            const { accountKey } = await createAccount();
            const { profileKey } = await createProfile(accountKey);
            const { pillRoutineKey } = await PillRoutineObjectGenerator.createDayPeriodPillRoutine(
                accountKey, profileKey, 2, ["12:00", "13:00", "12:00"]
            )
            const today = new Date();
            const pillDatetime = new Date(
                today.getFullYear(),
                today.getMonth(), 
                today.getDate(), 
                12,
                0,
            )
            console.log(pillDatetime.getTimezoneOffset())

            const body = createModifiedPillBody("manualyConfirmed", pillDatetime.toISOString());
            console.log(body);
            let response = await postModifiedPill(accountKey, profileKey, pillRoutineKey, body)

            console.log(response.body);

            expect(response.status).toBe(201);
            expect(response.body.status).toBe("manualyConfirmed");

            response = await getModifiedPills(accountKey, profileKey, pillRoutineKey);

            console.log(response.body);
            expect(response.status).toBe(200);
            expect(response.body.data.length).toBe(1);
            expect(response.body.data[0].status).toBe("manualyConfirmed");
            expect(response.body.data[0].quantity).toBe(2);
            expect(response.body.data[0].statusEvents.length).toBe(1);
            expect(response.body.data[0].statusEvents[0].status).toBe("manualyConfirmed");
        });

        it("Create on database with weekdays", async ()=>{
            const { accountKey } = await createAccount();
            const { profileKey } = await createProfile(accountKey);
            const { pillRoutineKey } = await PillRoutineObjectGenerator.createWeekdaysPillRoutine(
                accountKey, 
                profileKey,
                {
                    monday: ["13:30"],
                    tuesday: ["13:30"],
                    wednesday: ["13:30"],
                    thursday: ["13:30"],
                    friday: ["13:30"],
                    saturday: ["13:30"],
                    sunday: ["13:30"],

                }
            )
            const today = new Date();
            const pillDatetime = new Date(
                today.getFullYear(),
                today.getMonth(), 
                today.getDate(), 
                13,
                30,
            )
            console.log(pillDatetime.getTimezoneOffset())

            const body = createModifiedPillBody("manualyConfirmed", pillDatetime.toISOString());
            console.log(body);
            let response = await postModifiedPill(accountKey, profileKey, pillRoutineKey, body)

            console.log(response.body);

            expect(response.status).toBe(201);
            expect(response.body.status).toBe("manualyConfirmed");

            response = await getModifiedPills(accountKey, profileKey, pillRoutineKey);

            console.log(response.body);
            expect(response.status).toBe(200);
            expect(response.body.data.length).toBe(1);
            expect(response.body.data[0].status).toBe("manualyConfirmed");
            expect(response.body.data[0].statusEvents.length).toBe(1);
            expect(response.body.data[0].statusEvents[0].status).toBe("manualyConfirmed");
        });

        it("Create with right quantity with weekdays", async ()=>{
            const { accountKey } = await createAccount();
            const { profileKey } = await createProfile(accountKey);
            const { pillRoutineKey } = await PillRoutineObjectGenerator.createWeekdaysPillRoutine(
                accountKey, 
                profileKey,
                {
                    monday: ["13:30", "12:00", "13:30"],
                    tuesday: ["13:30", "12:00", "13:30"],
                    wednesday: ["13:30", "12:00", "13:30"],
                    thursday: ["13:30", "12:00", "13:30"],
                    friday: ["13:30", "12:00", "13:30"],
                    saturday: ["13:30", "12:00", "13:30"],
                    sunday: ["13:30", "12:00", "13:30"],

                }
            )
            const today = new Date();
            const pillDatetime = new Date(
                today.getFullYear(),
                today.getMonth(), 
                today.getDate(), 
                13,
                30,
            )
            console.log(pillDatetime.getTimezoneOffset())

            const body = createModifiedPillBody("manualyConfirmed", pillDatetime.toISOString());
            console.log(body);
            let response = await postModifiedPill(accountKey, profileKey, pillRoutineKey, body)

            console.log(response.body);

            expect(response.status).toBe(201);
            expect(response.body.status).toBe("manualyConfirmed");

            response = await getModifiedPills(accountKey, profileKey, pillRoutineKey);

            console.log(response.body);
            expect(response.status).toBe(200);
            expect(response.body.data.length).toBe(1);
            expect(response.body.data[0].quantity).toBe(2);
            expect(response.body.data[0].status).toBe("manualyConfirmed");
            expect(response.body.data[0].statusEvents.length).toBe(1);
            expect(response.body.data[0].statusEvents[0].status).toBe("manualyConfirmed");
        });
    });
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
            createModifiedPill(accountKey, profileKey, pillRoutineKey, "manualyConfirmed", pillDatetime.toISOString());

            const response = await getModifiedPills(accountKey, profileKey, pillRoutineKey, "lalala")

            console.log(response.body);
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
            createModifiedPill(accountKey, profileKey, pillRoutineKey, "manualyConfirmed", pillDatetime.toISOString());

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
            createModifiedPill(accountKey, profileKey, pillRoutineKey, "manualyConfirmed", pillDatetime.toISOString());

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
            createModifiedPill(account1.accountKey, profileKey, pillRoutineKey, "manualyConfirmed", pillDatetime.toISOString());

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
            createModifiedPill(
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
            createModifiedPill(
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

            createModifiedPill(
                accountKey, 
                profileKey, 
                pillRoutine2.pillRoutineKey, 
                "manualyConfirmed", 
                pillDatetime.toISOString()
            );

            let response = await getModifiedPills(accountKey, profileKey, pillRoutine1.pillRoutineKey)
            console.log(response.body);

            expect(response.status).toBe(200)
            expect(response.body.data.length).toBe(0);

            response = await getModifiedPills(accountKey, profileKey, pillRoutine2.pillRoutineKey)

            expect(response.status).toBe(200)
            expect(response.body.data.length).toBe(1);
        });
    })
})