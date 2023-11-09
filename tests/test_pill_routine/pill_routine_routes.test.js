const { describe } = require("node:test");
const { postPillRoutine, getProfilePillRoutines } = require("../utils/route_generator");
const { createAccount, createProfile } = require("../utils/object_generator");
const { PillRoutineBodyGenerator } = require("../utils/body_generator");

describe("Pill Routine Routes", async ()=>{
    describe("POST /account/:accountKey/profile/:profileKey/pill_routine", async ()=>{
        it("Return 404 if profile is from other account", async ()=>{
            const account1 = await createAccount();
            const account2 = await createAccount();
            const { profileKey } = await createProfile(account1.accountKey);
            
            const body = PillRoutineBodyGenerator.createDayPeriodPillRoutineBody();
            const response = await postPillRoutine(account2.accountKey, profileKey, body);

            console.log(response.body);
            expect(response.status).toBe(404);
            expect(response.body.code).toBe("ERR00002");
        });
        it("Return 400 when missing name propertie", async ()=>{
            const { accountKey } = await createAccount();
            const { profileKey } = await createProfile(accountKey);
            
            let body = PillRoutineBodyGenerator.createDayPeriodPillRoutineBody();
            delete body.name;
            const response = await postPillRoutine(accountKey, profileKey, body);

            expect(response.status).toBe(400);
            expect(response.body.code).toBe("SCHEMA_ERR");
        });
        it("Return 400 with additional properties", async ()=>{
            const { accountKey } = await createAccount();
            const { profileKey } = await createProfile(accountKey);
            
            let body = PillRoutineBodyGenerator.createDayPeriodPillRoutineBody();
            body.other = "other"
            const response = await postPillRoutine(accountKey, profileKey, body);

            expect(response.status).toBe(400);
            expect(response.body.code).toBe("SCHEMA_ERR");
        });
        it("Return 404 if pillRoutineType does not exists", async ()=>{
            const { accountKey } = await createAccount();
            const { profileKey } = await createProfile(accountKey);
            
            let body = PillRoutineBodyGenerator.createDayPeriodPillRoutineBody();
            body.pillRoutineType = "other";
            const response = await postPillRoutine(accountKey, profileKey, body);

            expect(response.status).toBe(404);
            expect(response.body.code).toBe("ERR00004");
        });

        describe("weekdays pillRoutineType", async () => {
            it("Return 400 if routineData has additionalProperties", async ()=>{
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

            it("Return 400 if some hour is malformated", async ()=>{
                const { accountKey } = await createAccount();
                const { profileKey } = await createProfile(accountKey);
                
                let body = PillRoutineBodyGenerator.createWeekdaysPillRoutineBody({
                    monday: ["12.00"]
                });
                const response = await postPillRoutine(accountKey, profileKey, body);
                
                expect(response.status).toBe(400);
                expect(response.body.code).toBe("SCHEMA_ERR");
            });

            it("Return 400 if routine_data doesn't have any day", async ()=>{
                const { accountKey } = await createAccount();
                const { profileKey } = await createProfile(accountKey);
                
                let body = PillRoutineBodyGenerator.createWeekdaysPillRoutineBody({});
                const response = await postPillRoutine(accountKey, profileKey, body);
    
                console.log(response.body)
                expect(response.status).toBe(400);
                expect(response.body.code).toBe("ERR00005");
            });
        
            it("Return 400 if some hour is invalid", async ()=>{
                const { accountKey } = await createAccount();
                const { profileKey } = await createProfile(accountKey);
                
                let body = PillRoutineBodyGenerator.createWeekdaysPillRoutineBody({
                    monday: ["12:00", "13:00"],
                    tuesday: ["11:00", "24:00"]
                });
                let response = await postPillRoutine(accountKey, profileKey, body);

                expect(response.status).toBe(400);
                expect(response.body.code).toBe("ERR00005");

                body = PillRoutineBodyGenerator.createWeekdaysPillRoutineBody({
                    monday: ["12:00", "13:00"],
                    tuesday: ["11:00", "11:60"]
                });
                response = await postPillRoutine(accountKey, profileKey, body);
    
                expect(response.status).toBe(400);
                expect(response.body.code).toBe("ERR00005");
            });

            it("Creates sucessfuly when body is right", async ()=>{
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
        });

        describe("dayPeriod pillRoutineType", async ()=>{
            it("Return 400 if routineData has additionalProperties", async ()=>{
                const { accountKey } = await createAccount();
                const { profileKey } = await createProfile(accountKey);
                
                let body = PillRoutineBodyGenerator.createDayPeriodPillRoutineBody();
                body.pillRoutineData.other = "other";
                const response = await postPillRoutine(accountKey, profileKey, body);
    
                expect(response.status).toBe(400);
                expect(response.body.code).toBe("SCHEMA_ERR");
            });

            it("Return 400 if periodInDays is missing", async ()=>{
                const { accountKey } = await createAccount();
                const { profileKey } = await createProfile(accountKey);
                
                let body = PillRoutineBodyGenerator.createDayPeriodPillRoutineBody();
                delete body.pillRoutineData.periodInDays;
                const response = await postPillRoutine(accountKey, profileKey, body);
    
                expect(response.status).toBe(400);
                expect(response.body.code).toBe("SCHEMA_ERR");
            });

            it("Return 400 if pillsTimes is missing", async ()=>{
                const { accountKey } = await createAccount();
                const { profileKey } = await createProfile(accountKey);
                
                let body = PillRoutineBodyGenerator.createDayPeriodPillRoutineBody();
                delete body.pillRoutineData.pillsTimes;
                const response = await postPillRoutine(accountKey, profileKey, body);
    
                expect(response.status).toBe(400);
                expect(response.body.code).toBe("SCHEMA_ERR");
            });

            it("Return 400 if some pill_time is malformated", async ()=>{
                const { accountKey } = await createAccount();
                const { profileKey } = await createProfile(accountKey);
                
                let body = PillRoutineBodyGenerator.createDayPeriodPillRoutineBody(pillsTimes=[
                    "12:00", "11:00", "15-02"
                ]);
                const response = await postPillRoutine(accountKey, profileKey, body);
    
                expect(response.status).toBe(400);
                expect(response.body.code).toBe("SCHEMA_ERR");
            });

            it("Return 400 if period_in_days is less than zero", async ()=>{
                const { accountKey } = await createAccount();
                const { profileKey } = await createProfile(accountKey);
                
                let body = PillRoutineBodyGenerator.createDayPeriodPillRoutineBody(periodInDays=-1);
                const response = await postPillRoutine(accountKey, profileKey, body);
    
                expect(response.status).toBe(400);
                expect(response.body.code).toBe("SCHEMA_ERR");
            });

            it("Return 400 if some pill_time is an invalid time", async ()=>{
                const { accountKey } = await createAccount();
                const { profileKey } = await createProfile(accountKey);
                
                let body = PillRoutineBodyGenerator.createDayPeriodPillRoutineBody(pillsTimes=[
                    "12:00", "11:00", "24:00"
                ]);
                let response = await postPillRoutine(accountKey, profileKey, body);

                expect(response.status).toBe(400);
                expect(response.body.code).toBe("ERR00006");

                body = PillRoutineBodyGenerator.createDayPeriodPillRoutineBody(pillsTimes=[
                    "12:00", "11:00", "21:60"
                ]);
                response = await postPillRoutine(accountKey, profileKey, body);
    
                expect(response.status).toBe(400);
                expect(response.body.code).toBe("ERR00006");
            });

            it("Creates sucessfuly when body is right", async ()=>{
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
        })
    })
})