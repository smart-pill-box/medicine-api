const { describe } = require("node:test");
const { postPillRoutine, getProfilePillRoutines, putPillRoutine } = require("../utils/route_generator");
const { createAccount, createProfile, PillRoutineObjectGenerator } = require("../utils/object_generator");
const { PillRoutineBodyGenerator, createUpdatePillRoutineBody } = require("../utils/body_generator");
const { createSignedToken } = require("../utils/keycloak_mock");
const { addDays } = require("date-fns");

describe("POST /account/:accountKey/profile/:profileKey/pill_routine", async ()=>{
    test("Return 401 with malformated Token", async ()=>{
        const {accountKey} = await createAccount();
        const {profileKey} = await createProfile(accountKey);
    
        const body = PillRoutineBodyGenerator.createDayPeriodPillRoutineBody();
        const response = await postPillRoutine(accountKey, profileKey, body, "lalalala");

        expect(response.status).toBe(401)
        expect(response.body.code).toBe("JWT_ERROR");
    });
    test("Return 401 with expired token", async ()=>{
        const {accountKey} = await createAccount();
        const {profileKey} = await createProfile(accountKey);
    
        const token = createSignedToken(accountKey, {expiresIn: "-1 days"})
        const body = PillRoutineBodyGenerator.createDayPeriodPillRoutineBody();
        const response = await postPillRoutine(accountKey, profileKey, body, token);

        expect(response.status).toBe(401)
        expect(response.body.code).toBe("EXPIRED_ERR");
    });
    test("Return 401 with token before nbf", async ()=>{
        const {accountKey} = await createAccount();
        const {profileKey} = await createProfile(accountKey);
    
        const token = createSignedToken(accountKey, {notBefore: "1 days"})
        const body = PillRoutineBodyGenerator.createDayPeriodPillRoutineBody();
        const response = await postPillRoutine(accountKey, profileKey, body, token);

        expect(response.status).toBe(401)
        expect(response.body.code).toBe("NBF_ERR");
    });
    test("Return 401 unauthorized with token of other account", async ()=>{
        let account1 = await createAccount();
        let account2 = await createAccount();
        const {profileKey} = await createProfile(account1.accountKey);

        const token = createSignedToken(account2.accountKey);
        const body = PillRoutineBodyGenerator.createDayPeriodPillRoutineBody();
        const response = await postPillRoutine(account1.accountKey, profileKey, body, token);

        expect(response.status).toBe(401)
        expect(response.body.code).toBe("UNAUTHORIZED")
    });

    test("Return 404 if profile is from other account", async ()=>{
        const account1 = await createAccount();
        const account2 = await createAccount();
        const { profileKey } = await createProfile(account1.accountKey);
        
        const body = PillRoutineBodyGenerator.createDayPeriodPillRoutineBody();
        const response = await postPillRoutine(account2.accountKey, profileKey, body);

        expect(response.status).toBe(404);
        expect(response.body.code).toBe("ERR00002");
    });
    test("Return 400 when missing name propertie", async ()=>{
        const { accountKey } = await createAccount();
        const { profileKey } = await createProfile(accountKey);
        
        let body = PillRoutineBodyGenerator.createDayPeriodPillRoutineBody();
        delete body.name;
        const response = await postPillRoutine(accountKey, profileKey, body);

        expect(response.status).toBe(400);
        expect(response.body.code).toBe("SCHEMA_ERR");
    });
    test("Return 400 with additional properties", async ()=>{
        const { accountKey } = await createAccount();
        const { profileKey } = await createProfile(accountKey);
        
        let body = PillRoutineBodyGenerator.createDayPeriodPillRoutineBody();
        body.other = "other"
        const response = await postPillRoutine(accountKey, profileKey, body);

        expect(response.status).toBe(400);
        expect(response.body.code).toBe("SCHEMA_ERR");
    });
    test("Return 404 if pillRoutineType does not exists", async ()=>{
        const { accountKey } = await createAccount();
        const { profileKey } = await createProfile(accountKey);
        
        let body = PillRoutineBodyGenerator.createDayPeriodPillRoutineBody();
        body.pillRoutineType = "other";
        const response = await postPillRoutine(accountKey, profileKey, body);

        expect(response.status).toBe(404);
        expect(response.body.code).toBe("ERR00004");
    });

    test("Can't create with start date on the past", async ()=>{
        const { accountKey } = await createAccount();
        const { profileKey } = await createProfile(accountKey);

        const yesterday = addDays(new Date(), -1);
        
        let body = PillRoutineBodyGenerator.createDayPeriodPillRoutineBody(2, ["12:00"], yesterday.toISOString());
        const response = await postPillRoutine(accountKey, profileKey, body);

        expect(response.status).toBe(400);
        expect(response.body.code).toBe("ERR00015");
    });

    test("expiration date can't be lower than start_date", async ()=>{
        const { accountKey } = await createAccount();
        const { profileKey } = await createProfile(accountKey);

        const today = new Date();
        const yesterday = addDays(today, -1);
        const tomorrow = addDays(today, 1);
        
        let body = PillRoutineBodyGenerator.createDayPeriodPillRoutineBody(2, ["12:00"], undefined, yesterday.toISOString());
        let response = await postPillRoutine(accountKey, profileKey, body);

        expect(response.status).toBe(400);
        expect(response.body.code).toBe("ERR00016");

        body = PillRoutineBodyGenerator.createDayPeriodPillRoutineBody(
            2,
            ["12:00"],
            tomorrow.toISOString(),
            today.toISOString()
        );
        response = await postPillRoutine(accountKey, profileKey, body);

        expect(response.status).toBe(400);
        expect(response.body.code).toBe("ERR00016");
    })

    test("Create expiration Date and start_date if they are given", async ()=>{
        const { accountKey } = await createAccount();
        const { profileKey } = await createProfile(accountKey);

        const today = new Date();
        const tomorrow = addDays(today, 1);
        const afterTomorrow = addDays(today, 2);
        
        let body = PillRoutineBodyGenerator.createDayPeriodPillRoutineBody(
            2,
            ["12:00"],
            tomorrow.toISOString(), 
            afterTomorrow.toISOString()
        );
        let response = await postPillRoutine(accountKey, profileKey, body);

        expect(response.status).toBe(201);

        response = await getProfilePillRoutines(accountKey, profileKey)
        expect(response.status).toBe(200);
        expect(response.body.data.length).toBe(1);
        expect(response.body.data[0].startDatetime).toBe(tomorrow.toISOString());
        expect(response.body.data[0].expirationDatetime).toBe(afterTomorrow.toISOString());

    });
});

describe("POST weekdays pillRoutineType", async () => {
    test("Return 400 if routineData has additionalProperties", async ()=>{
        const { accountKey } = await createAccount();
        const { profileKey } = await createProfile(accountKey);
        
        let body = PillRoutineBodyGenerator.createWeekdaysPillRoutineBody({
            monday: ["12:00"]
        });
        body.pillRoutineData.other = "other";
        const response = await postPillRoutine(accountKey, profileKey, body);

        expect(response.status).toBe(400);
        expect(response.body.code).toBe("SCHEMA_ERR");
    });

    test("Return 400 if some hour is malformated", async ()=>{
        const { accountKey } = await createAccount();
        const { profileKey } = await createProfile(accountKey);
        
        let body = PillRoutineBodyGenerator.createWeekdaysPillRoutineBody({
            monday: ["12.00"]
        });
        const response = await postPillRoutine(accountKey, profileKey, body);
        
        expect(response.status).toBe(400);
        expect(response.body.code).toBe("SCHEMA_ERR");
    });

    test("Return 400 if some hour is invalid", async ()=>{
        const { accountKey } = await createAccount();
        const { profileKey } = await createProfile(accountKey);
        
        let body = PillRoutineBodyGenerator.createWeekdaysPillRoutineBody({
            monday: ["12:00", "13:00"],
            tuesday: ["11:00", "24:00"]
        });
        let response = await postPillRoutine(accountKey, profileKey, body);

        expect(response.status).toBe(400);
        expect(response.body.code).toBe("SCHEMA_ERR");

        body = PillRoutineBodyGenerator.createWeekdaysPillRoutineBody({
            monday: ["12:00", "13:00"],
            tuesday: ["11:00", "11:60"]
        });
        response = await postPillRoutine(accountKey, profileKey, body);

        expect(response.status).toBe(400);
        expect(response.body.code).toBe("SCHEMA_ERR");
    });

    test("Return 400 if routine_data doesn't have any day", async ()=>{
        const { accountKey } = await createAccount();
        const { profileKey } = await createProfile(accountKey);
        
        let body = PillRoutineBodyGenerator.createWeekdaysPillRoutineBody({});
        const response = await postPillRoutine(accountKey, profileKey, body);

        expect(response.status).toBe(400);
        expect(response.body.code).toBe("ERR00005");
    });

    test("Creates sucessfuly when body is right", async ()=>{
        const { accountKey } = await createAccount();
        const { profileKey } = await createProfile(accountKey);
        
        let body = PillRoutineBodyGenerator.createWeekdaysPillRoutineBody({
            monday: ["12:00", "13:00"],
            tuesday: ["11:00", "20:35"]
        });
        let response = await postPillRoutine(accountKey, profileKey, body);

        expect(response.status).toBe(201);

        const pillRoutineKey = response.body.pillRoutineKey;

        response = await getProfilePillRoutines(accountKey, profileKey);

        expect(response.status).toBe(200);
        expect(response.body.data.length).toBe(1);
        expect(response.body.data[0].pillRoutineKey).toBe(pillRoutineKey)
    });

    test("Create status event and save to DB", async ()=>{
        const { accountKey } = await createAccount();
        const { profileKey } = await createProfile(accountKey);
        
        let body = PillRoutineBodyGenerator.createWeekdaysPillRoutineBody({
            monday: ["12:00", "13:00"],
            tuesday: ["11:00", "20:35"]
        });
        let response = await postPillRoutine(accountKey, profileKey, body);

        expect(response.status).toBe(201);

        response = await getProfilePillRoutines(accountKey, profileKey);

        expect(response.status).toBe(200);
        expect(response.body.data.length).toBe(1);
        expect(response.body.data[0].status).toBe("active")
        expect(response.body.data[0].statusEvents.length).toBe(1)
        expect(response.body.data[0].statusEvents[0].status).toBe("active")
    });
});

describe("POST dayPeriod pillRoutineType", async ()=>{
    test("Return 400 if routineData has additionalProperties", async ()=>{
        const { accountKey } = await createAccount();
        const { profileKey } = await createProfile(accountKey);
        
        let body = PillRoutineBodyGenerator.createDayPeriodPillRoutineBody();
        body.pillRoutineData.other = "other";
        const response = await postPillRoutine(accountKey, profileKey, body);

        expect(response.status).toBe(400);
        expect(response.body.code).toBe("SCHEMA_ERR");
    });

    test("Return 400 if periodInDays is missing", async ()=>{
        const { accountKey } = await createAccount();
        const { profileKey } = await createProfile(accountKey);
        
        let body = PillRoutineBodyGenerator.createDayPeriodPillRoutineBody();
        delete body.pillRoutineData.periodInDays;
        const response = await postPillRoutine(accountKey, profileKey, body);

        expect(response.status).toBe(400);
        expect(response.body.code).toBe("SCHEMA_ERR");
    });

    test("Return 400 if pillsTimes is missing", async ()=>{
        const { accountKey } = await createAccount();
        const { profileKey } = await createProfile(accountKey);
        
        let body = PillRoutineBodyGenerator.createDayPeriodPillRoutineBody();
        delete body.pillRoutineData.pillsTimes;
        const response = await postPillRoutine(accountKey, profileKey, body);

        expect(response.status).toBe(400);
        expect(response.body.code).toBe("SCHEMA_ERR");
    });

    test("Return 400 if some pill_time is malformated", async ()=>{
        const { accountKey } = await createAccount();
        const { profileKey } = await createProfile(accountKey);
        
        let body = PillRoutineBodyGenerator.createDayPeriodPillRoutineBody(pillsTimes=[
            "12:00", "11:00", "15-02"
        ]);
        const response = await postPillRoutine(accountKey, profileKey, body);

        expect(response.status).toBe(400);
        expect(response.body.code).toBe("SCHEMA_ERR");
    });

    test("Return 400 if period_in_days is less than zero", async ()=>{
        const { accountKey } = await createAccount();
        const { profileKey } = await createProfile(accountKey);
        
        let body = PillRoutineBodyGenerator.createDayPeriodPillRoutineBody(periodInDays=-1);
        const response = await postPillRoutine(accountKey, profileKey, body);

        expect(response.status).toBe(400);
        expect(response.body.code).toBe("SCHEMA_ERR");
    });

    test("Return 400 if some pill_time is an invalid time", async ()=>{
        const { accountKey } = await createAccount();
        const { profileKey } = await createProfile(accountKey);
        
        let body = PillRoutineBodyGenerator.createDayPeriodPillRoutineBody(pillsTimes=[
            "12:00", "11:00", "24:00"
        ]);
        let response = await postPillRoutine(accountKey, profileKey, body);

        expect(response.status).toBe(400);
        expect(response.body.code).toBe("SCHEMA_ERR");

        body = PillRoutineBodyGenerator.createDayPeriodPillRoutineBody(pillsTimes=[
            "12:00", "11:00", "21:60"
        ]);
        response = await postPillRoutine(accountKey, profileKey, body);

        expect(response.status).toBe(400);
        expect(response.body.code).toBe("SCHEMA_ERR");
    });

    test("Creates sucessfuly when body is right", async ()=>{
        const { accountKey } = await createAccount();
        const { profileKey } = await createProfile(accountKey);
        
        let body = PillRoutineBodyGenerator.createDayPeriodPillRoutineBody(
            periodInDays = 1,
            pillsTimes = ["12:00", "11:00", "22:00"], 
        );
        let response = await postPillRoutine(accountKey, profileKey, body);

        expect(response.status).toBe(201);
        
        const pillRoutineKey = response.body.pillRoutineKey;

        response = await getProfilePillRoutines(accountKey, profileKey);

        expect(response.status).toBe(200)
        expect(response.body.data.length).toBe(1)
        expect(response.body.data[0].pillRoutineKey).toBe(pillRoutineKey);
    });
    test("Create status event and save to DB", async ()=>{
        const { accountKey } = await createAccount();
        const { profileKey } = await createProfile(accountKey);
        
        let body = PillRoutineBodyGenerator.createDayPeriodPillRoutineBody(
            periodInDays = 1,
            pillsTimes = ["12:00", "11:00", "22:00"], 
        );
        let response = await postPillRoutine(accountKey, profileKey, body);

        expect(response.status).toBe(201);
        
        response = await getProfilePillRoutines(accountKey, profileKey);

        expect(response.status).toBe(200);
        expect(response.body.data.length).toBe(1);
        expect(response.body.data[0].status).toBe("active")
        expect(response.body.data[0].statusEvents.length).toBe(1)
        expect(response.body.data[0].statusEvents[0].status).toBe("active")
    });
})

describe("PUT /account/:accountKey/profile/:profileKey/pill_routine/:pillRoutineKey", async ()=>{
    test("Return 401 with malformated Token", async ()=>{
        const { accountKey } = await createAccount();
        const { profileKey } = await createProfile(accountKey);
        const { pillRoutineKey } = await PillRoutineObjectGenerator.createDayPeriodPillRoutine(
            accountKey, profileKey, 2, ["12:00"]
        );
        
        const today = new Date();
        const tomorrow = addDays(today, 1);

        const body = createUpdatePillRoutineBody(startDate=tomorrow.toISOString());
        const response = await putPillRoutine(accountKey, profileKey, pillRoutineKey, body, "LALALALA");
    
        expect(response.status).toBe(401)
        expect(response.body.code).toBe("JWT_ERROR");
    });

    test("Return 401 with expired token", async ()=>{
        const {accountKey} = await createAccount();
        const {profileKey} = await createProfile(accountKey);
                const { pillRoutineKey } = await PillRoutineObjectGenerator.createDayPeriodPillRoutine(
            accountKey, profileKey, 2, ["12:00"]
        );
        const today = new Date();
        const tomorrow = addDays(today, 1);
    
        const token = createSignedToken(accountKey, {expiresIn: "-1 days"})

        const body = createUpdatePillRoutineBody(startDate=tomorrow.toISOString());
        const response = await putPillRoutine(accountKey, profileKey, pillRoutineKey, body, token);

        expect(response.status).toBe(401)
        expect(response.body.code).toBe("EXPIRED_ERR");
    });

    test("Return 401 with token before nbf", async ()=>{
        const {accountKey} = await createAccount();
        const {profileKey} = await createProfile(accountKey);
        const { pillRoutineKey } = await PillRoutineObjectGenerator.createDayPeriodPillRoutine(
            accountKey, profileKey, 2, ["12:00"]
        );
        
        const today = new Date();
        const tomorrow = addDays(today, 1);

        const token = createSignedToken(accountKey, {notBefore: "1 days"})
        const body = createUpdatePillRoutineBody(startDate=tomorrow.toISOString());
        const response = await putPillRoutine(accountKey, profileKey, pillRoutineKey, body, token);

        expect(response.status).toBe(401)
        expect(response.body.code).toBe("NBF_ERR");
    });

    test("Return 401 unauthorized with token of other account", async ()=>{
        let account1 = await createAccount();
        let account2 = await createAccount();
        const { profileKey } = await createProfile(account1.accountKey);
        const { pillRoutineKey } = await PillRoutineObjectGenerator.createDayPeriodPillRoutine(
            account1.accountKey, profileKey, 2, ["12:00"]
        );
        
        const today = new Date();
        const tomorrow = addDays(today, 1);

        const token = createSignedToken(account2.accountKey);
        const body = createUpdatePillRoutineBody(startDate=tomorrow.toISOString());
        const response = await putPillRoutine(account1.accountKey, profileKey, pillRoutineKey, body, token);

        expect(response.status).toBe(401)
        expect(response.body.code).toBe("UNAUTHORIZED")
    });

    test("Return 404 if profile is from other account", async ()=>{
        const account1 = await createAccount();
        const account2 = await createAccount();
        const { profileKey } = await createProfile(account1.accountKey);
        
        const { pillRoutineKey } = await PillRoutineObjectGenerator.createDayPeriodPillRoutine(account1.accountKey, profileKey, 2, ["12:00"]);

        const tomorrow = addDays(new Date(), 1);

        const body = createUpdatePillRoutineBody(startDate=tomorrow.toISOString())
        const response = await putPillRoutine(account2.accountKey, profileKey, pillRoutineKey, body);

        expect(response.status).toBe(404);
        expect(response.body.code).toBe("ERR00009");
    });

    test("Return 404 if type does not exists", async ()=>{

    });

    test("Return 400 if some error in the pillRoutineData", async ()=>{

    });

    test("Can't update initial date to the past", async ()=>{
        const { accountKey } = await createAccount();
        const { profileKey } = await createProfile(accountKey);
        const { pillRoutineKey } = await PillRoutineObjectGenerator.createDayPeriodPillRoutine(
            accountKey, profileKey, 2, ["12:00"]
        );
        
        const today = new Date();
        const yesterday = addDays(today, -1);

        const body = createUpdatePillRoutineBody(undefined, undefined, yesterday.toISOString());
        const response = await putPillRoutine(accountKey, profileKey, pillRoutineKey, body);
    
        expect(response.status).toBe(400)
        expect(response.body.code).toBe("ERR00015");
    });

    test("Can't update expiration date to before start date", async ()=>{
        const { accountKey } = await createAccount();
        const { profileKey } = await createProfile(accountKey);
        const { pillRoutineKey } = await PillRoutineObjectGenerator.createDayPeriodPillRoutine(
            accountKey, profileKey, 2, ["12:00"]
        );
        
        const today = new Date();
        const yesterday = addDays(today, -1);
        const tomorrow = addDays(today, 1);

        let body = createUpdatePillRoutineBody(undefined, undefined, tomorrow.toISOString(), today.toISOString());
        let response = await putPillRoutine(accountKey, profileKey, pillRoutineKey, body);
    
        expect(response.status).toBe(400)
        expect(response.body.code).toBe("ERR00016");

        body = createUpdatePillRoutineBody(undefined, undefined, undefined, yesterday.toISOString());
        response = await putPillRoutine(accountKey, profileKey, pillRoutineKey, body);
    
        expect(response.status).toBe(400)
        expect(response.body.code).toBe("ERR00016");
    });

    test("Create on DB, update status and create status event", async ()=>{
        const { accountKey } = await createAccount();
        const { profileKey } = await createProfile(accountKey);
        const { pillRoutineKey:updatedPillRoutineKey } = await PillRoutineObjectGenerator.createDayPeriodPillRoutine(
            accountKey, profileKey, 2, ["12:00"]
        );
        
        const today = new Date();
        const tomorrow = addDays(today, 1);

        let body = createUpdatePillRoutineBody(undefined, undefined, tomorrow.toISOString());
        let response = await putPillRoutine(accountKey, profileKey, updatedPillRoutineKey, body);
    
        expect(response.status).toBe(201);
        expect(response.body.status).toBe("active");
        expect(response.body.statusEvents.length).toBe(1);

        const newPillRoutineKey = response.body.pillRoutineKey;

        response = await getProfilePillRoutines(accountKey, profileKey);

        expect(response.status).toBe(200);
        expect(response.body.data.length).toBe(2);
        let foundRoutines = 0;
        response.body.data.forEach(pillRoutine=>{
            if(pillRoutine.pillRoutineKey == updatedPillRoutineKey){
                expect(pillRoutine.status).toBe("updated");
                expect(pillRoutine.statusEvents.length).toBe(2);
                foundRoutines += 1;
            }
            if(pillRoutine.pillRoutineKey == newPillRoutineKey){
                expect(pillRoutine.status).toBe("active");
                expect(pillRoutine.statusEvents.length).toBe(1);
                foundRoutines += 1;
            }
        })
        expect(foundRoutines).toBe(2);
    });

    test("Update start date when it is given and mantain others", async ()=>{
        const { accountKey } = await createAccount();
        const { profileKey } = await createProfile(accountKey);
        const { 
            pillRoutineKey, 
            pillRoutineData,
        } = await PillRoutineObjectGenerator.createDayPeriodPillRoutine(
            accountKey, profileKey, 2, ["12:00"]
        );
        
        const today = new Date();
        const tomorrow = addDays(today, 1);

        let body = createUpdatePillRoutineBody(undefined, undefined, tomorrow.toISOString());
        let response = await putPillRoutine(accountKey, profileKey, pillRoutineKey, body);
    
        expect(response.status).toBe(201);

        const newPillRoutineKey = response.body.pillRoutineKey;
        response = await getProfilePillRoutines(accountKey, profileKey);

        expect(response.status).toBe(200);
        expect(response.body.data.length).toBe(2);
        let foundRoutines = 0;
        response.body.data.forEach(pillRoutine=>{
            if(pillRoutine.pillRoutineKey == newPillRoutineKey){
                expect(pillRoutine.startDatetime).toBe(tomorrow.toISOString());
                expect(pillRoutine.pillRoutineType).toBe("dayPeriod");
                expect(pillRoutine.pillRoutineData).toStrictEqual(pillRoutineData);
                foundRoutines += 1;
            }
        })
        expect(foundRoutines).toBe(1);

    });

    test("Update expiration date when it is given and mantain others", async ()=>{
        const { accountKey } = await createAccount();
        const { profileKey } = await createProfile(accountKey);
        const { pillRoutineKey, pillRoutineData, startDatetime } = await PillRoutineObjectGenerator.createDayPeriodPillRoutine(
            accountKey, profileKey, 2, ["12:00"]
        );
        
        const today = new Date();
        const tomorrow = addDays(today, 1);

        let body = createUpdatePillRoutineBody(undefined, undefined, undefined, tomorrow.toISOString());
        let response = await putPillRoutine(accountKey, profileKey, pillRoutineKey, body);
    
        expect(response.status).toBe(201);

        const newPillRoutineKey = response.body.pillRoutineKey;

        response = await getProfilePillRoutines(accountKey, profileKey);
        
        expect(response.status).toBe(200);
        expect(response.body.data.length).toBe(2);
        let foundRoutines = 0;
        response.body.data.forEach(pillRoutine=>{
            if(pillRoutine.pillRoutineKey == newPillRoutineKey){
                expect(pillRoutine.expirationDatetime).toBe(tomorrow.toISOString());
                expect(pillRoutine.pillRoutineType).toBe("dayPeriod");
                expect(pillRoutine.pillRoutineData).toStrictEqual(pillRoutineData);
                foundRoutines += 1;
            }
        })
        expect(foundRoutines).toBe(1);
    });

    test("Update pillRoutineType and pillRoutineData", async ()=>{
        const { accountKey } = await createAccount();
        const { profileKey } = await createProfile(accountKey);
        const { pillRoutineKey, startDate } = await PillRoutineObjectGenerator.createDayPeriodPillRoutine(
            accountKey, profileKey, 2, ["12:00"]
        );
        
        const today = new Date();

        const newPillRoutineData = {
            monday: ["12:00", "13:00"]
        };
        const newPillRoutineType = "weekdays";

        let body = createUpdatePillRoutineBody(
            newPillRoutineType,
            newPillRoutineData,
        );
        let response = await putPillRoutine(accountKey, profileKey, pillRoutineKey, body);

        expect(response.status).toBe(201);

        const newPillRoutineKey = response.body.pillRoutineKey;

        response = await getProfilePillRoutines(accountKey, profileKey);

        expect(response.status).toBe(200);
        expect(response.body.data.length).toBe(2);

        let foundRoutines = 0;
        response.body.data.forEach(pillRoutine=>{
            if(pillRoutine.pillRoutineKey == newPillRoutineKey){
                expect(pillRoutine.pillRoutineData).toStrictEqual(newPillRoutineData);
                expect(pillRoutine.pillRoutineType).toBe(newPillRoutineType);
                foundRoutines += 1;
            }
        })
        expect(foundRoutines).toBe(1);
    });

    test("Update just pillRoutineData", async ()=>{
        const { accountKey } = await createAccount();
        const { profileKey } = await createProfile(accountKey);
        const { pillRoutineKey, startDate } = await PillRoutineObjectGenerator.createWeekdaysPillRoutine(
            accountKey, profileKey, {
                monday: ["12:00"]
            }
        );
        
        const newPillRoutineData = {
            monday: ["12:00", "13:00"]
        };

        let body = createUpdatePillRoutineBody(
            undefined,
            newPillRoutineData
        );
        let response = await putPillRoutine(accountKey, profileKey, pillRoutineKey, body);

        expect(response.status).toBe(201);

        const newPillRoutineKey = response.body.pillRoutineKey;

        response = await getProfilePillRoutines(accountKey, profileKey);

        expect(response.status).toBe(200);
        expect(response.body.data.length).toBe(2);

        let foundRoutines = 0;
        response.body.data.forEach(pillRoutine=>{
            if(pillRoutine.pillRoutineKey == newPillRoutineKey){
                expect(pillRoutine.pillRoutineData).toStrictEqual(newPillRoutineData);
                expect(pillRoutine.pillRoutineType).toBe("weekdays");
                foundRoutines += 1;
            }
        })
        expect(foundRoutines).toBe(1);
    });
});

// TODO test GET pillRoutine route

// TODO test PUT pillRoutine status