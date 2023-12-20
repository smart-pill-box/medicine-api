const { createAccount, createProfile, PillRoutineObjectGenerator, updatePillStatus, createPillReeschadule, updatePillRoutine } = require("../utils/object_generator");
const { createUpdatePillBody, createPillReeschaduleBody } = require("../utils/body_generator");
const { putPillStatus, getModifiedPills, getProfilePills, postPillReeschadule, getPillReeschadule } = require("../utils/route_generator");
const { createSignedToken } = require("../utils/keycloak_mock");
const { addDays, isEqual, addMinutes } = require("date-fns");
const DateUtils = require("../utils/date_utils");
const { describe } = require("node:test");

describe("GET pills Routes", ()=>{
    test("Return 401 with malformated Token", async ()=>{
        const { accountKey } = await createAccount();
        const { profileKey } = await createProfile(accountKey);
        const { pillRoutineKey } = await PillRoutineObjectGenerator.createDayPeriodPillRoutine(
            accountKey, profileKey, 2, ["12:00"]
        )

        const response = await getProfilePills(
            accountKey, 
            profileKey, 
            {
                fromDate: "2023-03-01", 
                toDate: "2023-03-02"
            },
            "lalalalal"
        );

        expect(response.status).toBe(401)
        expect(response.body.code).toBe("JWT_ERROR");
    });

    test("Return 401 with expired token", async ()=>{
        const { accountKey } = await createAccount();
        const { profileKey } = await createProfile(accountKey);
        const { pillRoutineKey } = await PillRoutineObjectGenerator.createDayPeriodPillRoutine(
            accountKey, profileKey, 2, ["12:00"]
        )
    
        const token = createSignedToken(accountKey, {expiresIn: "-1 days"})
        const response = await getProfilePills(
            accountKey, 
            profileKey, 
            {
                fromDate: "2023-03-01", 
                toDate: "2023-03-02"
            },
            token
        );
        expect(response.status).toBe(401)
        expect(response.body.code).toBe("EXPIRED_ERR");
    });

    test("Return 401 with token before nbf", async ()=>{
        const { accountKey } = await createAccount();
        const { profileKey } = await createProfile(accountKey);
        const { pillRoutineKey } = await PillRoutineObjectGenerator.createDayPeriodPillRoutine(
            accountKey, profileKey, 2, ["12:00"]
        )

        const token = createSignedToken(accountKey, {notBefore: "1 days"})
        const response = await getProfilePills(
            accountKey, 
            profileKey, 
            {
                fromDate: "2023-03-01", 
                toDate: "2023-03-02"
            },
            token
        );
        expect(response.status).toBe(401)
        expect(response.body.code).toBe("NBF_ERR");
    });

    test("Return 401 unauthorized with token of other account", async ()=>{
        let account1 = await createAccount();
        let account2 = await createAccount();
        const { profileKey } = await createProfile(account1.accountKey);
        const { pillRoutineKey } = await PillRoutineObjectGenerator.createDayPeriodPillRoutine(
            account1.accountKey, profileKey, 2, ["12:00"]
        )

        const token = createSignedToken(account2.accountKey);
        const response = await getProfilePills(
            account1.accountKey, 
            profileKey, 
            {
                fromDate: "2023-03-01", 
                toDate: "2023-03-02"
            },
            token
        );

        expect(response.status).toBe(401)
        expect(response.body.code).toBe("UNAUTHORIZED")
    });

    test("Return 404 if profile is from other account", async ()=>{
        let account1 = await createAccount();
        let account2 = await createAccount();
        const {profileKey} = await createProfile(account1.accountKey);
        const { pillRoutineKey } = await PillRoutineObjectGenerator.createDayPeriodPillRoutine(
            account1.accountKey, profileKey, 2, ["12:00"]
        )

        const response = await getProfilePills(
            account2.accountKey, 
            profileKey, 
            {
                fromDate: "2023-03-01", 
                toDate: "2023-03-02"
            }
        );

        expect(response.status).toBe(404)
        expect(response.body.code).toBe("ERR00002")
    });

    test("Return 400 if is missing query parameter", async ()=>{
        let { accountKey } = await createAccount();
        const {profileKey} = await createProfile(accountKey);
        const { pillRoutineKey } = await PillRoutineObjectGenerator.createDayPeriodPillRoutine(
            accountKey, profileKey, 2, ["12:00"]
        )

        const response = await getProfilePills(
            accountKey, 
            profileKey, 
            {
                fromDate: "2023-03-01", 
            }
        );

        expect(response.status).toBe(400)
        expect(response.body.code).toBe("SCHEMA_ERR")
    });

    test("Return 400 if have additional query parameters", async ()=>{
        let { accountKey } = await createAccount();
        const {profileKey} = await createProfile(accountKey);
        const { pillRoutineKey } = await PillRoutineObjectGenerator.createDayPeriodPillRoutine(
            accountKey, profileKey, 2, ["12:00"]
        )

        const response = await getProfilePills(
            accountKey, 
            profileKey, 
            {
                fromDate: "2023-03-01",
                toDate: "2023-03-02",
                other: "other"
            }
        );

        expect(response.status).toBe(400)
        expect(response.body.code).toBe("SCHEMA_ERR")
    });

    test("Return right pills and quantity with dayPeriodRoutine with right status", async ()=>{
        let { accountKey } = await createAccount();
        const {profileKey} = await createProfile(accountKey);

        const today = new Date();
        const tomorrow = addDays(today, 1);
        const afterTomorrow = addDays(today, 2);
        const startDate = new Date(tomorrow);
        startDate.setUTCHours(0, 0, 0, 0);
        const afterAfterTomorrow = addDays(today, 3);

        const { pillRoutineKey } = await PillRoutineObjectGenerator.createDayPeriodPillRoutine(
            accountKey, profileKey, 2, ["12:00", "13:30", "12:00"], startDate.toISOString()
        );


        const response = await getProfilePills(
            accountKey, 
            profileKey, 
            {
                fromDate: DateUtils.getDateString(today),
                toDate: DateUtils.getDateString(afterAfterTomorrow),
            }
        );

        expect(response.status).toBe(200);
        expect(response.body.data.length).toBe(4);

        let pillsToFind = [
            {
                datetime: (new Date(DateUtils.getDateString(tomorrow) + "T12:00")).toISOString(),
                quantity: 2
            },
            {
                datetime: (new Date(DateUtils.getDateString(afterAfterTomorrow) + "T12:00")).toISOString(),
                quantity: 2
            },
            {
                datetime: (new Date(DateUtils.getDateString(tomorrow) + "T13:30")).toISOString(),
                quantity: 1
            },
            {
                datetime: (new Date(DateUtils.getDateString(afterAfterTomorrow) + "T13:30")).toISOString(),
                quantity: 1
            },
        ]

        let foundPills = 0; 
        pillsToFind.forEach(pillToFind => {
            response.body.data.forEach(pill=>{
                expect(pill.pillRoutineKey).toBe(pillRoutineKey);
                expect(pill.status).toBe("pending");
                if((pill.pillDatetime == pillToFind.datetime) && (pill.quantity == pillToFind.quantity)){
                    foundPills += 1;
                    return
                }
            })
        });

        expect(foundPills).toBe(4);

    });

    test("Return right pills and quantity with weekdaysRoutine", async ()=>{
        let { accountKey } = await createAccount();
        const { profileKey } = await createProfile(accountKey);
        const hoursString = ["12:00", "13:30", "12:00"];

        const today = new Date();
        const tomorrow = addDays(today, 1);
        const afterTomorrow = addDays(today, 2);

        let routineData = {};
        routineData[DateUtils.dayNumberToString(tomorrow.getDay())] = hoursString;
        routineData[DateUtils.dayNumberToString(afterTomorrow.getDay())] = hoursString;

        const { pillRoutineKey } = await PillRoutineObjectGenerator.createWeekdaysPillRoutine(
            accountKey, profileKey, routineData
        );


        const response = await getProfilePills(
            accountKey, 
            profileKey, 
            {
                fromDate: DateUtils.getDateString(today),
                toDate: DateUtils.getDateString(afterTomorrow),
            }
        );

        expect(response.status).toBe(200);
        expect(response.body.data.length).toBe(4);

        let pillsToFind = [
            {
                datetime: (new Date(DateUtils.getDateString(tomorrow) + "T12:00")).toISOString(),
                quantity: 2
            },
            {
                datetime: (new Date(DateUtils.getDateString(afterTomorrow) + "T12:00")).toISOString(),
                quantity: 2
            },
            {
                datetime: (new Date(DateUtils.getDateString(tomorrow) + "T13:30")).toISOString(),
                quantity: 1
            },
            {
                datetime: (new Date(DateUtils.getDateString(afterTomorrow) + "T13:30")).toISOString(),
                quantity: 1
            },
        ]

        let foundPills = 0;
        pillsToFind.forEach(pillToFind => {
            response.body.data.forEach(pill=>{
                expect(pill.status).toBe("pending");
                expect(pill.pillRoutineKey).toBe(pillRoutineKey);
                if(pill.pillDatetime == pillToFind.datetime && (pill.quantity == pillToFind.quantity)){
                    foundPills += 1;
                    return
                }
            })
        });

        expect(foundPills).toBe(4);
    });

    test("Return right pills and quantity with dayPeriod and Weekdays Routines", async ()=>{
        let { accountKey } = await createAccount();
        const { profileKey } = await createProfile(accountKey);

        const today = new Date();
        const tomorrow = addDays(today, 1);
        const afterTomorrow = addDays(today, 2);
        const afterAfterTomorrow = addDays(today, 3);
        const startDatetime = new Date(tomorrow);
        startDatetime.setUTCHours(0,0,0,0);

        let routineData = {};
        routineData[DateUtils.dayNumberToString(afterTomorrow.getDay())] = ["12:00", "13:30", "12:00"];

        const { pillRoutineKey: weekdaysRoutineKey } = await PillRoutineObjectGenerator.createWeekdaysPillRoutine(
            accountKey, profileKey, routineData, startDatetime.toISOString()
        );
        const { pillRoutineKey: dayPeriodRoutineKey } = await PillRoutineObjectGenerator.createDayPeriodPillRoutine(
            accountKey, profileKey, 3, ["12:00", "13:30", "12:00"], startDatetime.toISOString()
        );

        const response = await getProfilePills(
            accountKey, 
            profileKey, 
            {
                fromDate: DateUtils.getDateString(today),
                toDate: DateUtils.getDateString(afterAfterTomorrow),
            }
        );

        expect(response.status).toBe(200);
        expect(response.body.data.length).toBe(4);

        let pillsToFind = [
            {
                datetime: (new Date(DateUtils.getDateString(afterTomorrow) + "T12:00")).toISOString(),
                quantity: 2,
                routineKey: weekdaysRoutineKey
            },
            {
                datetime: (new Date(DateUtils.getDateString(afterTomorrow) + "T13:30")).toISOString(),
                quantity: 1,
                routineKey: weekdaysRoutineKey
            },
            {
                datetime: (new Date(DateUtils.getDateString(afterTomorrow) + "T12:00")).toISOString(),
                quantity: 2,
                routineKey: dayPeriodRoutineKey
            },
            {
                datetime: (new Date(DateUtils.getDateString(afterTomorrow) + "T13:30")).toISOString(),
                quantity: 1,
                routineKey: dayPeriodRoutineKey
            },
        ]

        let foundPills = 0;
        pillsToFind.forEach(pillToFind => {
            response.body.data.forEach(pill=>{
                expect(pill.status).toBe("pending");
                if(
                    pill.pillDatetime == pillToFind.datetime 
                    && (pill.quantity == pillToFind.quantity)
                    && (pill.pillRoutineKey == pillToFind.routineKey)
                    ){
                    foundPills += 1;
                    return
                }
            })
        });
    });

    test("Substitute routine pills with modified pills on weekdays routines", async ()=>{
        let { accountKey } = await createAccount();
        const { profileKey } = await createProfile(accountKey);
        const hoursString = ["12:00", "13:30", "12:00"];

        const today = new Date();
        const tomorrow = addDays(today, 1);
        const afterTomorrow = addDays(today, 2);

        let routineData = {};
        routineData[DateUtils.dayNumberToString(tomorrow.getDay())] = hoursString;
        routineData[DateUtils.dayNumberToString(afterTomorrow.getDay())] = hoursString;

        const { pillRoutineKey } = await PillRoutineObjectGenerator.createWeekdaysPillRoutine(
            accountKey, profileKey, routineData
        );

        await updatePillStatus(
            accountKey, 
            profileKey, 
            pillRoutineKey, 
            "manualyConfirmed",
            DateUtils.sameDateOtherHour(tomorrow, "12:00").toISOString()
        );

        await updatePillStatus(
            accountKey, 
            profileKey, 
            pillRoutineKey, 
            "canceled",
            DateUtils.sameDateOtherHour(afterTomorrow, "13:30").toISOString()
        );

        const response = await getProfilePills(
            accountKey, 
            profileKey, 
            {
                fromDate: DateUtils.getDateString(tomorrow),
                toDate: DateUtils.getDateString(afterTomorrow),
            }
        );

        expect(response.status).toBe(200);
        expect(response.body.data.length).toBe(4);

        let pillsToFind = [
            {
                datetime: (new Date(DateUtils.getDateString(tomorrow) + "T12:00")).toISOString(),
                quantity: 2,
                status: "manualyConfirmed"
            },
            {
                datetime: (new Date(DateUtils.getDateString(afterTomorrow) + "T12:00")).toISOString(),
                quantity: 2,
                status: "pending"
            },
            {
                datetime: (new Date(DateUtils.getDateString(tomorrow) + "T13:30")).toISOString(),
                quantity: 1,
                status: "pending"
            },
            {
                datetime: (new Date(DateUtils.getDateString(afterTomorrow) + "T13:30")).toISOString(),
                quantity: 1,
                status: "canceled"
            },
        ]

        let foundPills = 0;
        pillsToFind.forEach(pillToFind => {
            response.body.data.forEach(pill=>{
                expect(pill.pillRoutineKey).toBe(pillRoutineKey);
                if((pill.pillDatetime == pillToFind.datetime)
                    && (pill.quantity == pillToFind.quantity)
                    && (pill.status == pillToFind.status)
                    ){
                    foundPills += 1;
                    return
                }
            })
        });

        expect(foundPills).toBe(4);
    });

    test("Substitute routine pills with modified pills on dayPeriod routines", async ()=>{
        let { accountKey } = await createAccount();
        const {profileKey} = await createProfile(accountKey);
        const today = new Date();
        const tomorrow = addDays(today, 1);
        const afterTomorrow = addDays(today, 2);
        const afterAfterTomorrow = addDays(today, 3);
        const startDatetime = new Date(tomorrow);
        startDatetime.setUTCHours(0,0,0,0);

        const { pillRoutineKey } = await PillRoutineObjectGenerator.createDayPeriodPillRoutine(
            accountKey, profileKey, 2, ["12:00", "13:30", "12:00"], startDatetime
        );


        await updatePillStatus(
            accountKey, 
            profileKey, 
            pillRoutineKey, 
            "manualyConfirmed",
            DateUtils.sameDateOtherHour(tomorrow, "12:00").toISOString()
        );

        await updatePillStatus(
            accountKey, 
            profileKey, 
            pillRoutineKey, 
            "canceled",
            DateUtils.sameDateOtherHour(afterAfterTomorrow, "13:30").toISOString()
        );

        const response = await getProfilePills(
            accountKey, 
            profileKey, 
            {
                fromDate: DateUtils.getDateString(today),
                toDate: DateUtils.getDateString(afterAfterTomorrow),
            }
        );

        expect(response.status).toBe(200);
        expect(response.body.data.length).toBe(4);

        let pillsToFind = [
            {
                datetime: (new Date(DateUtils.getDateString(tomorrow) + "T12:00")).toISOString(),
                quantity: 2,
                status: "manualyConfirmed"
            },
            {
                datetime: (new Date(DateUtils.getDateString(afterAfterTomorrow) + "T12:00")).toISOString(),
                quantity: 2,
                status: "pending"
            },
            {
                datetime: (new Date(DateUtils.getDateString(tomorrow) + "T13:30")).toISOString(),
                quantity: 1,
                status: "pending"
            },
            {
                datetime: (new Date(DateUtils.getDateString(afterAfterTomorrow) + "T13:30")).toISOString(),
                quantity: 1,
                status: "canceled"
            },
        ]

        let foundPills = 0;
        pillsToFind.forEach(pillToFind => {
            response.body.data.forEach(pill=>{
                if((pill.pillDatetime == pillToFind.datetime) && (pill.quantity == pillToFind.quantity)){
                    foundPills += 1;
                    expect(pill.pillRoutineKey).toBe(pillRoutineKey);
                    expect(pill.status).toBe(pillToFind.status);
                    return
                }
            })
        });

        expect(foundPills).toBe(4);
    });

    test("Substitute routine pills with modified with both weekdays and day period routines", async ()=>{
        let { accountKey } = await createAccount();
        const { profileKey } = await createProfile(accountKey);

        const today = new Date();
        const tomorrow = addDays(today, 1);
        const startDatetime = new Date(tomorrow);
        startDatetime.setUTCHours(0,0,0,0);
        const afterTomorrow = addDays(today, 2);
        const afterAfterTomorrow = addDays(today, 3);

        let routineData = {};
        routineData[DateUtils.dayNumberToString(afterAfterTomorrow.getDay())] = ["12:00", "13:30", "12:00"];

        const { pillRoutineKey: weekdaysRoutineKey } = await PillRoutineObjectGenerator.createWeekdaysPillRoutine(
            accountKey, profileKey, routineData, startDatetime
        );
        const { pillRoutineKey: dayPeriodRoutineKey } = await PillRoutineObjectGenerator.createDayPeriodPillRoutine(
            accountKey, profileKey, 3, ["12:00", "13:30", "12:00"], startDatetime
        );

        await updatePillStatus(
            accountKey, 
            profileKey, 
            weekdaysRoutineKey, 
            "manualyConfirmed",
            DateUtils.sameDateOtherHour(afterAfterTomorrow, "12:00").toISOString()
        );

        await updatePillStatus(
            accountKey, 
            profileKey, 
            dayPeriodRoutineKey, 
            "canceled",
            DateUtils.sameDateOtherHour(tomorrow, "13:30").toISOString()
        );

        const response = await getProfilePills(
            accountKey, 
            profileKey, 
            {
                fromDate: DateUtils.getDateString(today),
                toDate: DateUtils.getDateString(afterAfterTomorrow),
            }
        );

        expect(response.status).toBe(200);
        expect(response.body.data.length).toBe(4);

        let pillsToFind = [
            {
                datetime: (new Date(DateUtils.getDateString(tomorrow) + "T12:00")).toISOString(),
                quantity: 2,
                routineKey: dayPeriodRoutineKey,
                status: "pending"
            },
            {
                datetime: (new Date(DateUtils.getDateString(tomorrow) + "T13:30")).toISOString(),
                quantity: 1,
                routineKey: dayPeriodRoutineKey,
                status: "canceled"
            },
            {
                datetime: (new Date(DateUtils.getDateString(afterAfterTomorrow) + "T12:00")).toISOString(),
                quantity: 2,
                routineKey: weekdaysRoutineKey,
                status: "manualyConfirmed"
            },
            {
                datetime: (new Date(DateUtils.getDateString(afterAfterTomorrow) + "T13:30")).toISOString(),
                quantity: 1,
                routineKey: weekdaysRoutineKey,
                status: "pending"
            },
        ]

        let foundPills = 0;
        pillsToFind.forEach(pillToFind => {
            response.body.data.forEach(pill=>{
                if(
                    pill.pillDatetime == pillToFind.datetime 
                    && (pill.quantity == pillToFind.quantity)
                    && (pill.pillRoutineKey == pillToFind.routineKey)
                    ){
                    expect(pill.status).toBe(pillToFind.status);
                    foundPills += 1;
                    return
                }
            })
        });
    });

    test("Just return pills after the start_date of a routine", async ()=>{
        let { accountKey } = await createAccount();
        const {profileKey} = await createProfile(accountKey);
        const today = new Date();
        const tomorrow = addDays(today, 1);
        tomorrow.setUTCHours(0,0,0,0)
        const { pillRoutineKey } = await PillRoutineObjectGenerator.createDayPeriodPillRoutine(
            accountKey, profileKey, 2, ["12:00"], tomorrow.toISOString()
        );

        const afterTomorrow = addDays(today, 2);

        const response = await getProfilePills(
            accountKey, 
            profileKey, 
            {
                fromDate: DateUtils.getDateString(today),
                toDate: DateUtils.getDateString(afterTomorrow),
            }
        );

        expect(response.status).toBe(200);
        expect(response.body.data.length).toBe(1);
    });

    test("Don't return pills after a pillRoutine is updated", async ()=>{
        let { accountKey } = await createAccount();
        const {profileKey} = await createProfile(accountKey);
        const today = new Date();
        const tomorrow = addDays(today, 1);
        const { pillRoutineKey } = await PillRoutineObjectGenerator.createDayPeriodPillRoutine(
            accountKey, profileKey, 2, ["12:00"], startDatetime=tomorrow.toISOString()
        );

        const afterTomorrow = addDays(today, 2);
        const afterAfterTomorrow = addDays(today, 3);

        await updatePillRoutine(accountKey, profileKey, pillRoutineKey, undefined, undefined, afterAfterTomorrow.toISOString());

        const response = await getProfilePills(
            accountKey, 
            profileKey, 
            {
                fromDate: DateUtils.getDateString(today),
                toDate: DateUtils.getDateString(afterAfterTomorrow),
            }
        );

        expect(response.status).toBe(200);
        expect(response.body.data.length).toBe(0);
    });

    test("Don't return pills if pillRoutine is already expired", async ()=>{
        let { accountKey } = await createAccount();
        const {profileKey} = await createProfile(accountKey);
        const today = new Date();
        const tomorrow = addDays(today, 1);
        const { pillRoutineKey } = await PillRoutineObjectGenerator.createDayPeriodPillRoutine(
            accountKey, profileKey, 2, ["12:00"], undefined, expirationDatetime=tomorrow.toISOString()
        );

        const afterTomorrow = addDays(today, 2);

        const response = await getProfilePills(
            accountKey, 
            profileKey, 
            {
                fromDate: DateUtils.getDateString(today),
                toDate: DateUtils.getDateString(afterTomorrow),
            }
        );

        expect(response.status).toBe(200);
        expect(response.body.data.length).toBe(1);
    })
});

describe("PUT Pill status /account/:accountKey/profile/:profileKey/pill_routine/:pillRoutineKey/pill/:pillDatetime", ()=>{
    test("Return 401 with malformated Token", async ()=>{
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

        const body = createUpdatePillBody("manualyConfirmed");
        const response = await putPillStatus(accountKey, profileKey, pillRoutineKey, pillDatetime.toISOString(), body, "lalala")


        expect(response.status).toBe(401)
        expect(response.body.code).toBe("JWT_ERROR");

    });

    test("Return 401 with expired token", async ()=>{
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
        const body = createUpdatePillBody("manualyConfirmed");
        const response = await putPillStatus(accountKey, profileKey, pillRoutineKey, pillDatetime.toISOString(), body, token)

        expect(response.status).toBe(401)
        expect(response.body.code).toBe("EXPIRED_ERR");
    });

    test("Return 401 with token before nbf", async ()=>{
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
        const body = createUpdatePillBody("manualyConfirmed");
        const response = await putPillStatus(accountKey, profileKey, pillRoutineKey, pillDatetime.toISOString(), body, token)

        expect(response.status).toBe(401)
        expect(response.body.code).toBe("NBF_ERR");
    });

    test("Return 401 unauthorized with token of other account", async ()=>{
        let account1 = await createAccount();
        let account2 = await createAccount();
        const {profileKey} = await createProfile(account1.accountKey);
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

        const token = createSignedToken(account2.accountKey);
        const body = createUpdatePillBody("manualyConfirmed");
        const response = await putPillStatus(account1.accountKey, profileKey, pillRoutineKey, pillDatetime.toISOString(), body, token)

        expect(response.status).toBe(401)
        expect(response.body.code).toBe("UNAUTHORIZED")
    });

    test("Return 404 if profile is from other account", async ()=>{
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

        const body = createUpdatePillBody("manualyConfirmed");
        const response = await putPillStatus(account2.accountKey, profileKey, pillRoutineKey, pillDatetime.toISOString(), body)

        expect(response.status).toBe(404);
        expect(response.body.code).toBe("ERR00009");
    });

    test("Return 404 if pill_routine is from other profile", async ()=>{
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

        const body = createUpdatePillBody("manualyConfirmed");
        const response = await putPillStatus(accountKey, profile2.profileKey, pillRoutineKey, pillDatetime.toISOString(), body)

        expect(response.status).toBe(404);
        expect(response.body.code).toBe("ERR00009");
    });

    test("Return 404 if status does not exist", async ()=>{
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

        const body = createUpdatePillBody("dont_exist");
        const response = await putPillStatus(accountKey, profileKey, pillRoutineKey, pillDatetime.toISOString(), body)

        expect(response.status).toBe(404);
        expect(response.body.code).toBe("ERR00006");
    });

    test("Return 400 when missing properties", async ()=>{
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

        const body = createUpdatePillBody("manualyConfirmed");
        delete body["status"]
        const response = await putPillStatus(accountKey, profileKey, pillRoutineKey, pillDatetime.toISOString(), body)

        expect(response.status).toBe(400);
        expect(response.body.code).toBe("SCHEMA_ERR");
    });

    test("Return 400 with additionalProperties", async ()=>{
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

        const body = createUpdatePillBody("manualyConfirmed");
        body["additional"] = "seila"
        const response = await putPillStatus(accountKey, profileKey, pillRoutineKey, pillDatetime.toISOString(), body)

        expect(response.status).toBe(400);
        expect(response.body.code).toBe("SCHEMA_ERR");
    });

    test("Return 400 if seconds in datetime is not 00", async ()=>{
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

        const body = createUpdatePillBody("manualyConfirmed");
        const response = await putPillStatus(accountKey, profileKey, pillRoutineKey, pillDatetime.toISOString(), body)

        expect(response.status).toBe(400);
        expect(response.body.code).toBe("SCHEMA_ERR");
    });

    test("Return 400 if miliseconds in datetime is not 00", async ()=>{
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

        const body = createUpdatePillBody("manualyConfirmed");
        const response = await putPillStatus(accountKey, profileKey, pillRoutineKey, pillDatetime.toISOString(), body)

        expect(response.status).toBe(400);
        expect(response.body.code).toBe("SCHEMA_ERR");
    });

    test("Return 400 if datetime is not valid", async ()=>{
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
        const body = createUpdatePillBody("manualyConfirmed");
        const response = await putPillStatus(accountKey, profileKey, pillRoutineKey, datetimeStr, body)

        expect(response.status).toBe(400);
        expect(response.body.code).toBe("ERR00007");
    });

    test("Return 400 if datetime does not exist on this routine", async ()=>{
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

        const body = createUpdatePillBody("manualyConfirmed");
        const response = await putPillStatus(accountKey, profileKey, pillRoutineKey, wrongPillDatetime.toISOString(), body)

        expect(response.status).toBe(400);
        expect(response.body.code).toBe("ERR00008");
    });

    test("Return 400 if try to update to not authorized statuses", async ()=>{
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

        const body = createUpdatePillBody("reeschaduled");
        const response = await putPillStatus(accountKey, profileKey, pillRoutineKey, pillDatetime.toISOString(), body)

        expect(response.status).toBe(400);
        expect(response.body.code).toBe("ERR00010");
    });

    test("Create on database on success and create status_event", async ()=>{
        const { accountKey } = await createAccount();
        const { profileKey } = await createProfile(accountKey);

        const today = new Date();
        const tomorrow = addDays(today, 1);
        const startDatetime = addDays(today, 1);
        startDatetime.setUTCHours(0,0,0,0);
        const pillDatetime = new Date(
            tomorrow.getFullYear(),
            tomorrow.getMonth(), 
            tomorrow.getDate(), 
            12,
            0,
        )

        const { pillRoutineKey } = await PillRoutineObjectGenerator.createDayPeriodPillRoutine(
            accountKey, profileKey, 2, ["12:00"], startDatetime.toISOString()
        )

        const body = createUpdatePillBody("manualyConfirmed");
        let response = await putPillStatus(accountKey, profileKey, pillRoutineKey, pillDatetime.toISOString(), body)


        expect(response.status).toBe(201);
        expect(response.body.status).toBe("manualyConfirmed");

        response = await getModifiedPills(accountKey, profileKey, pillRoutineKey);

        expect(response.status).toBe(200);
        expect(response.body.data.length).toBe(1);
        expect(response.body.data[0].status).toBe("manualyConfirmed");
        expect(response.body.data[0].statusEvents.length).toBe(1);
        expect(response.body.data[0].statusEvents[0].status).toBe("manualyConfirmed");
    });

    test("Create confirmationDatetime if status is manualy confirmed", async ()=>{
        const { accountKey } = await createAccount();
        const { profileKey } = await createProfile(accountKey);

        const today = new Date();
        const tomorrow = addDays(today, 1);
        const startDatetime = addDays(today, 1);
        startDatetime.setUTCHours(0,0,0,0);

        const { pillRoutineKey } = await PillRoutineObjectGenerator.createDayPeriodPillRoutine(
            accountKey, profileKey, 2, ["12:00"], startDatetime.toISOString()
        )

        const pillDatetime = new Date(
            tomorrow.getFullYear(),
            tomorrow.getMonth(), 
            tomorrow.getDate(), 
            12,
            0,
        )

        const body = createUpdatePillBody("manualyConfirmed");
        let response = await putPillStatus(accountKey, profileKey, pillRoutineKey, pillDatetime.toISOString(), body)

        expect(response.status).toBe(201);
        expect(response.body.status).toBe("manualyConfirmed");
        expect(response.body.confirmationDatetime).toBeDefined();
    });

    test("Create with right quantity with dayPeriod", async ()=>{
        const { accountKey } = await createAccount();
        const { profileKey } = await createProfile(accountKey);
        
        const today = new Date();
        const tomorrow = addDays(today, 1);
        const startDatetime = addDays(today, 1);
        startDatetime.setUTCHours(0,0,0,0);

        const { pillRoutineKey } = await PillRoutineObjectGenerator.createDayPeriodPillRoutine(
            accountKey, profileKey, 2, ["12:00", "13:00", "12:00"], startDatetime.toISOString()
        )
        const pillDatetime = new Date(
            tomorrow.getFullYear(),
            tomorrow.getMonth(), 
            tomorrow.getDate(), 
            12,
            0,
        )

        const body = createUpdatePillBody("manualyConfirmed");
        let response = await putPillStatus(accountKey, profileKey, pillRoutineKey, pillDatetime.toISOString(), body)


        expect(response.status).toBe(201);
        expect(response.body.status).toBe("manualyConfirmed");

        response = await getModifiedPills(accountKey, profileKey, pillRoutineKey);

        expect(response.status).toBe(200);
        expect(response.body.data.length).toBe(1);
        expect(response.body.data[0].status).toBe("manualyConfirmed");
        expect(response.body.data[0].quantity).toBe(2);
        expect(response.body.data[0].statusEvents.length).toBe(1);
        expect(response.body.data[0].statusEvents[0].status).toBe("manualyConfirmed");
    });

    test("Create on database with weekdays", async ()=>{
        const { accountKey } = await createAccount();
        const { profileKey } = await createProfile(accountKey);

        const today = new Date();
        const tomorrow = addDays(today, 1);
        const startDatetime = addDays(today, 1);
        startDatetime.setUTCHours(0,0,0,0);

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

            },
            startDatetime.toISOString()
        )
        const pillDatetime = new Date(
            tomorrow.getFullYear(),
            tomorrow.getMonth(), 
            tomorrow.getDate(), 
            13,
            30,
        )

        const body = createUpdatePillBody("manualyConfirmed");
        let response = await putPillStatus(accountKey, profileKey, pillRoutineKey, pillDatetime.toISOString(), body)


        expect(response.status).toBe(201);
        expect(response.body.status).toBe("manualyConfirmed");

        response = await getModifiedPills(accountKey, profileKey, pillRoutineKey);

        expect(response.status).toBe(200);
        expect(response.body.data.length).toBe(1);
        expect(response.body.data[0].status).toBe("manualyConfirmed");
        expect(response.body.data[0].statusEvents.length).toBe(1);
        expect(response.body.data[0].statusEvents[0].status).toBe("manualyConfirmed");
    });

    test("Create with right quantity with weekdays", async ()=>{
        const { accountKey } = await createAccount();
        const { profileKey } = await createProfile(accountKey);

        const today = new Date();
        const tomorrow = addDays(today, 1);
        const startDatetime = addDays(today, 1);
        startDatetime.setUTCHours(0,0,0,0);

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

            },
            startDatetime.toISOString()
        )
        const pillDatetime = new Date(
            tomorrow.getFullYear(),
            tomorrow.getMonth(), 
            tomorrow.getDate(), 
            13,
            30,
        )

        const body = createUpdatePillBody("manualyConfirmed");
        let response = await putPillStatus(accountKey, profileKey, pillRoutineKey, pillDatetime.toISOString(), body)


        expect(response.status).toBe(201);
        expect(response.body.status).toBe("manualyConfirmed");

        response = await getModifiedPills(accountKey, profileKey, pillRoutineKey);

        expect(response.status).toBe(200);
        expect(response.body.data.length).toBe(1);
        expect(response.body.data[0].quantity).toBe(2);
        expect(response.body.data[0].status).toBe("manualyConfirmed");
        expect(response.body.data[0].statusEvents.length).toBe(1);
        expect(response.body.data[0].statusEvents[0].status).toBe("manualyConfirmed");
    });
});

describe("POST pill reeschadule /account/:accountKey/profile/:profileKey/pill_routine/:pillRoutineKey/pill/:pillDatetime/reeschadule", ()=>{
    test("Return 401 with malformated Token", async ()=>{
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
        const newDatetime = addMinutes(pillDatetime, 10);

        const body = createPillReeschaduleBody(newDatetime.toISOString());
        const response = await postPillReeschadule(accountKey, profileKey, pillRoutineKey, pillDatetime.toISOString(), body, "lalala")

        expect(response.status).toBe(401)
        expect(response.body.code).toBe("JWT_ERROR");

    });

    test("Return 401 with expired token", async ()=>{
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
        const newDatetime = addMinutes(pillDatetime, 10);

        const body = createPillReeschaduleBody(newDatetime.toISOString());
        const response = await postPillReeschadule(accountKey, profileKey, pillRoutineKey, pillDatetime.toISOString(), body, token)

        expect(response.status).toBe(401)
        expect(response.body.code).toBe("EXPIRED_ERR");
    });

    test("Return 401 with token before nbf", async ()=>{
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
        const newDatetime = addMinutes(pillDatetime, 10);

        const body = createPillReeschaduleBody(newDatetime.toISOString());
        const response = await postPillReeschadule(accountKey, profileKey, pillRoutineKey, pillDatetime.toISOString(), body, token)

        expect(response.status).toBe(401)
        expect(response.body.code).toBe("NBF_ERR");
    });

    test("Return 401 unauthorized with token of other account", async ()=>{
        let account1 = await createAccount();
        let account2 = await createAccount();
        const {profileKey} = await createProfile(account1.accountKey);
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

        const token = createSignedToken(account2.accountKey);
        const newDatetime = addMinutes(pillDatetime, 10);

        const body = createPillReeschaduleBody(newDatetime.toISOString());
        const response = await postPillReeschadule(account1.accountKey, profileKey, pillRoutineKey, pillDatetime.toISOString(), body, token)

        expect(response.status).toBe(401)
        expect(response.body.code).toBe("UNAUTHORIZED")
    });

    test("Return 404 if profile is from other account", async ()=>{
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

        const newDatetime = addMinutes(pillDatetime, 10);

        const body = createPillReeschaduleBody(newDatetime.toISOString());
        const response = await postPillReeschadule(account2.accountKey, profileKey, pillRoutineKey, pillDatetime.toISOString(), body)

        expect(response.status).toBe(404);
        expect(response.body.code).toBe("ERR00009");
    });

    test("Return 404 if pill_routine is from other profile", async ()=>{
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

        const newDatetime = addMinutes(pillDatetime, 10);

        const body = createPillReeschaduleBody(newDatetime.toISOString());
        const response = await postPillReeschadule(accountKey, profile2.profileKey, pillRoutineKey, pillDatetime.toISOString(), body)

        expect(response.status).toBe(404);
        expect(response.body.code).toBe("ERR00009");
    });

    test("Return 404 if pill does not exists", async ()=>{
        const { accountKey } = await createAccount();
        const { profileKey } = await createProfile(accountKey);
        const { pillRoutineKey } = await PillRoutineObjectGenerator.createDayPeriodPillRoutine(
            accountKey, profileKey, 2, ["12:00"]
        )
        const today = new Date();
        const wrongDatetime = new Date(
            today.getFullYear(),
            today.getMonth(), 
            today.getDate(), 
            13, 
            0
        )

        const newDatetime = addMinutes(wrongDatetime, 10);

        const body = createPillReeschaduleBody(newDatetime.toISOString());
        const response = await postPillReeschadule(accountKey, profileKey, pillRoutineKey, wrongDatetime.toISOString(), body)

        expect(response.status).toBe(404);
        expect(response.body.code).toBe("ERR00012");
    });

    test("Return 408 if a routinePill already exists in the same pillDatetime", async ()=>{
        const { accountKey } = await createAccount();
        const { profileKey } = await createProfile(accountKey);

        const today = new Date();
        const tomorrow = addDays(today, 1);
        const startDatetime = addDays(today, 1);
        startDatetime.setUTCHours(0,0,0,0);
        
        const { pillRoutineKey } = await PillRoutineObjectGenerator.createDayPeriodPillRoutine(
            accountKey, profileKey, 2, ["12:00"], startDatetime.toISOString()
        )
        const pillDatetime = new Date(
            tomorrow.getFullYear(),
            tomorrow.getMonth(), 
            tomorrow.getDate(), 
            12, 
            0
        )

        const newDatetime = addDays(pillDatetime, 2);

        const body = createPillReeschaduleBody(newDatetime.toISOString());
        const response = await postPillReeschadule(accountKey, profileKey, pillRoutineKey, pillDatetime.toISOString(), body)

        expect(response.status).toBe(408);
        expect(response.body.code).toBe("ERR00011");
    });

    test("Return 408 if a reeschaduled pill already exists in the same pillDatetime", async ()=>{
        const { accountKey } = await createAccount();
        const { profileKey } = await createProfile(accountKey);
        
        const today = new Date();
        const tomorrow = addDays(today, 1);
        const startDatetime = addDays(today, 1);
        startDatetime.setUTCHours(0,0,0,0);

        const { pillRoutineKey } = await PillRoutineObjectGenerator.createDayPeriodPillRoutine(
            accountKey, profileKey, 2, ["12:00"], startDatetime.toISOString()
        )
        const pill1Datetime = new Date(
            tomorrow.getFullYear(),
            tomorrow.getMonth(), 
            tomorrow.getDate(), 
            12, 
            0
        )

        const pill2Datetime = addDays(pill1Datetime, 2);

        const newDatetime = addDays(pill2Datetime, 1)
        
        await createPillReeschadule(accountKey, profileKey, pillRoutineKey, pill2Datetime.toISOString(), newDatetime.toISOString());

        const body = createPillReeschaduleBody(newDatetime.toISOString());
        const response = await postPillReeschadule(accountKey, profileKey, pillRoutineKey, pill1Datetime.toISOString(), body)

        expect(response.status).toBe(408);
        expect(response.body.code).toBe("ERR00011");
    });

    test("Return 400 if pill is canceled", async ()=>{
        const { accountKey } = await createAccount();
        const { profileKey } = await createProfile(accountKey);

        const today = new Date();
        const tomorrow = addDays(today, 1);
        const startDatetime = addDays(today, 1);
        startDatetime.setUTCHours(0,0,0,0);

        const { pillRoutineKey } = await PillRoutineObjectGenerator.createDayPeriodPillRoutine(
            accountKey, profileKey, 2, ["12:00"], startDatetime.toISOString()
        )
        const pillDatetime = new Date(
            tomorrow.getFullYear(),
            tomorrow.getMonth(), 
            tomorrow.getDate(), 
            12, 
            0
        )

        await updatePillStatus(accountKey, profileKey, pillRoutineKey, "canceled", pillDatetime.toISOString());

        const newDatetime = addMinutes(pillDatetime, 15)
        
        const body = createPillReeschaduleBody(newDatetime.toISOString());
        const response = await postPillReeschadule(accountKey, profileKey, pillRoutineKey, pillDatetime.toISOString(), body)

        expect(response.status).toBe(400);
        expect(response.body.code).toBe("ERR00013");
    });

    test("Return 400 if pill is already taken", async ()=>{
        const { accountKey } = await createAccount();
        const { profileKey } = await createProfile(accountKey);
        
        const today = new Date();
        const tomorrow = addDays(today, 1);
        const startDatetime = addDays(today, 1);
        startDatetime.setUTCHours(0,0,0,0);

        const { pillRoutineKey } = await PillRoutineObjectGenerator.createDayPeriodPillRoutine(
            accountKey, profileKey, 2, ["12:00"], startDatetime.toISOString()
        )
        const pillDatetime = new Date(
            tomorrow.getFullYear(),
            tomorrow.getMonth(), 
            tomorrow.getDate(), 
            12, 
            0
        )

        await updatePillStatus(accountKey, profileKey, pillRoutineKey, "manualyConfirmed", pillDatetime.toISOString());

        const newDatetime = addMinutes(pillDatetime, 15)

        const body = createPillReeschaduleBody(newDatetime.toISOString());
        const response = await postPillReeschadule(accountKey, profileKey, pillRoutineKey, pillDatetime.toISOString(), body)

        expect(response.status).toBe(400);
        expect(response.body.code).toBe("ERR00013");
    });

    test("Return 400 if pill was already reeschaduled", async ()=>{
        const { accountKey } = await createAccount();
        const { profileKey } = await createProfile(accountKey);

        const today = new Date();
        const tomorrow = addDays(today, 1);
        const startDatetime = addDays(today, 1);
        startDatetime.setUTCHours(0,0,0,0);

        const { pillRoutineKey } = await PillRoutineObjectGenerator.createDayPeriodPillRoutine(
            accountKey, profileKey, 2, ["12:00"], startDatetime.toISOString()
        )
        const pillDatetime = new Date(
            tomorrow.getFullYear(),
            tomorrow.getMonth(), 
            tomorrow.getDate(), 
            12, 
            0
        )
        
        const newDatetime1 = addMinutes(pillDatetime, 15);

        await createPillReeschadule(accountKey, profileKey, pillRoutineKey, pillDatetime.toISOString(), newDatetime1.toISOString());

        const newDatetime2 = addMinutes(newDatetime1, 15);
        const body = createPillReeschaduleBody(newDatetime2.toISOString());
        const response = await postPillReeschadule(accountKey, profileKey, pillRoutineKey, pillDatetime.toISOString(), body)

        expect(response.status).toBe(400);
        expect(response.body.code).toBe("ERR00013");
    });

    test("Return 201 on success, create on DB and create status event on both pills", async ()=>{
        const { accountKey } = await createAccount();
        const { profileKey } = await createProfile(accountKey);
        
        const today = new Date();
        const tomorrow = addDays(today, 1);
        const startDatetime = addDays(today, 1);
        startDatetime.setUTCHours(0,0,0,0);

        const { pillRoutineKey } = await PillRoutineObjectGenerator.createDayPeriodPillRoutine(
            accountKey, profileKey, 2, ["12:00"], startDatetime.toISOString()
        )
        const pillDatetime = new Date(
            tomorrow.getFullYear(),
            tomorrow.getMonth(), 
            tomorrow.getDate(), 
            12, 
            0
        );

        const newDatetime = addMinutes(pillDatetime, 15)
        
        const body = createPillReeschaduleBody(newDatetime.toISOString());
        let response = await postPillReeschadule(accountKey, profileKey, pillRoutineKey, pillDatetime.toISOString(), body)

        expect(response.status).toBe(201);

        response = await getPillReeschadule(accountKey, profileKey, pillRoutineKey, pillDatetime.toISOString());

        expect(response.status).toBe(200);
        expect(response.body.reeschaduledPill.pillDatetime).toBe(pillDatetime.toISOString());
        expect(response.body.reeschaduledPill.status).toBe("reeschaduled");
        expect(response.body.reeschaduledPill.statusEvents.length).toBe(1);
        expect(response.body.newPill.pillDatetime).toBe(newDatetime.toISOString());
        expect(response.body.newPill.status).toBe("pending");
        expect(response.body.newPill.statusEvents.length).toBe(1);
    });
});

// TODO THE PILL REESCHADULE ENDPOINT AND TESTS
// describe("GET pill reeschadule /account/:accountKey/profile/:profileKey/pill_routine/:pillRoutineKey/pill/:pillDatetime/reeschadule", ()=>{
//     test("Return 401 with malformated Token", async ()=>{
//         const { accountKey } = await createAccount();
//         const { profileKey } = await createProfile(accountKey);
//         const { pillRoutineKey } = await PillRoutineObjectGenerator.createDayPeriodPillRoutine(
//             accountKey, profileKey, 2, ["12:00"]
//         )
//         const today = new Date();
//         const pillDatetime = new Date(
//             today.getFullYear(), 
//             today.getMonth(), 
//             today.getDate(), 
//             12, 
//             0
//         );
//         const newDatetime = addMinutes(pillDatetime, 10);

//         await createPillReeschadule(accountKey, profileKey, pillRoutineKey, pillDatetime.toISOString(), newDatetime.toISOString());
//         const response = await getPillReeschadule(accountKey, profileKey, pillRoutineKey, pillDatetime.toISOString(), "lalala")

//         expect(response.status).toBe(401)
//         expect(response.body.code).toBe("JWT_ERROR");

//     });

//     test("Return 401 with expired token", async ()=>{
//         const { accountKey } = await createAccount();
//         const { profileKey } = await createProfile(accountKey);
//         const { pillRoutineKey } = await PillRoutineObjectGenerator.createDayPeriodPillRoutine(
//             accountKey, profileKey, 2, ["12:00"]
//         )

//         const today = new Date();
//         const pillDatetime = new Date(
//             today.getFullYear(), 
//             today.getMonth(), 
//             today.getDate(), 
//             12, 
//             0
//         )
    
//         const token = createSignedToken(accountKey, {expiresIn: "-1 days"})
//         const newDatetime = addMinutes(pillDatetime, 10);

//         await createPillReeschadule(accountKey, profileKey, pillRoutineKey, pillDatetime.toISOString(), newDatetime.toISOString());
//         const response = await getPillReeschadule(accountKey, profileKey, pillRoutineKey, pillDatetime.toISOString(), token)

//         expect(response.status).toBe(401)
//         expect(response.body.code).toBe("EXPIRED_ERR");
//     });

//     test("Return 401 with token before nbf", async ()=>{
//         const { accountKey } = await createAccount();
//         const { profileKey } = await createProfile(accountKey);
//         const { pillRoutineKey } = await PillRoutineObjectGenerator.createDayPeriodPillRoutine(
//             accountKey, profileKey, 2, ["12:00"]
//         )

//         const today = new Date();
//         const pillDatetime = new Date(
//             today.getFullYear(), 
//             today.getMonth(), 
//             today.getDate(), 
//             12, 
//             0
//         )

//         const token = createSignedToken(accountKey, {notBefore: "1 days"})
//         const newDatetime = addMinutes(pillDatetime, 10);

//         await createPillReeschadule(accountKey, profileKey, pillRoutineKey, pillDatetime.toISOString(), newDatetime.toISOString());
//         const response = await getPillReeschadule(accountKey, profileKey, pillRoutineKey, pillDatetime.toISOString(), token)

//         expect(response.status).toBe(401)
//         expect(response.body.code).toBe("NBF_ERR");
//     });

//     test("Return 401 unauthorized with token of other account", async ()=>{
//         let account1 = await createAccount();
//         let account2 = await createAccount();
//         const {profileKey} = await createProfile(account1.accountKey);
//         const { pillRoutineKey } = await PillRoutineObjectGenerator.createDayPeriodPillRoutine(
//             account1.accountKey, profileKey, 2, ["12:00"]
//         )

//         const today = new Date();
//         const pillDatetime = new Date(
//             today.getFullYear(), 
//             today.getMonth(), 
//             today.getDate(), 
//             12, 
//             0
//         )

//         const token = createSignedToken(account2.accountKey);
//         const newDatetime = addMinutes(pillDatetime, 10);

//         await createPillReeschadule(account1.accountKey, profileKey, pillRoutineKey, pillDatetime.toISOString(), newDatetime.toISOString());
//         const response = await getPillReeschadule(account1.accountKey, profileKey, pillRoutineKey, pillDatetime.toISOString(), token)

//         expect(response.status).toBe(401)
//         expect(response.body.code).toBe("UNAUTHORIZED")
//     });

//     test("Return 404 if profile is from other account", async ()=>{
//         const account1 = await createAccount();
//         const account2 = await createAccount();
//         const { profileKey } = await createProfile(account1.accountKey);
//         const { pillRoutineKey } = await PillRoutineObjectGenerator.createDayPeriodPillRoutine(
//             account1.accountKey, profileKey, 2, ["12:00"]
//         )
//         const today = new Date();
//         const pillDatetime = new Date(
//             today.getFullYear(), 
//             today.getMonth(), 
//             today.getDate(), 
//             12, 
//             0
//         )

//         const newDatetime = addMinutes(pillDatetime, 10);

//         await createPillReeschadule(account1.accountKey, profileKey, pillRoutineKey, pillDatetime.toISOString(), newDatetime.toISOString());
//         const response = await getPillReeschadule(account2.accountKey, profileKey, pillRoutineKey, pillDatetime.toISOString())

//         expect(response.status).toBe(404);
//         expect(response.body.code).toBe("ERR00012");
//     });

//     test("Return 404 if pill is not reeschaduled", async ()=>{
//         const { accountKey } = await createAccount();
//         const { profileKey } = await createProfile(accountKey);
//         const { pillRoutineKey } = await PillRoutineObjectGenerator.createDayPeriodPillRoutine(
//             accountKey, profileKey, 2, ["12:00"]
//         )
//         const today = new Date();
//         const pillDatetime = new Date(
//             today.getFullYear(), 
//             today.getMonth(), 
//             today.getDate(), 
//             12, 
//             0
//         )

//         const pillDatetime2 = addDays(pillDatetime, 2)

//         const newDatetime = addMinutes(pillDatetime2, 10);

//         await updatePillStatus(accountKey, profileKey, pillRoutineKey, "canceled", pillDatetime.toISOString());
//         await createPillReeschadule(accountKey, profileKey, pillRoutineKey, pillDatetime2.toISOString(), newDatetime.toISOString());
//         const response = await getPillReeschadule(accountKey, profileKey, pillRoutineKey, pillDatetime.toISOString())

//         expect(response.status).toBe(404);
//         expect(response.body.code).toBe("ERR00014");
//     });

//     test("Return 200 sucessfuly", async ()=>{
//         const { accountKey } = await createAccount();
//         const { profileKey } = await createProfile(accountKey);
//         const { pillRoutineKey } = await PillRoutineObjectGenerator.createDayPeriodPillRoutine(
//             accountKey, profileKey, 2, ["12:00"]
//         )
//         const today = new Date();
//         const pillDatetime = new Date(
//             today.getFullYear(), 
//             today.getMonth(), 
//             today.getDate(), 
//             12, 
//             0
//         )

//         const newDatetime = addMinutes(pillDatetime, 10);

//         await createPillReeschadule(accountKey, profileKey, pillRoutineKey, pillDatetime.toISOString(), newDatetime.toISOString());
//         const response = await getPillReeschadule(accountKey, profileKey, pillRoutineKey, pillDatetime.toISOString())

//         expect(response.status).toBe(200);
//         expect(response.body.reeschaduledPill.pillDatetime).toBe(pillDatetime.toISOString());
//         expect(response.body.reeschaduledPill.status).toBe("reeschaduled");
//         expect(response.body.newPill.pillDatetime).toBe(newDatetime.toISOString());
//         expect(response.body.newPill.status).toBe("pending");
//     });
// });