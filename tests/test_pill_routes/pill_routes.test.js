const { createAccount, createProfile, PillRoutineObjectGenerator, createModifiedPill } = require("../utils/object_generator");
const { createModifiedPillBody } = require("../utils/body_generator");
const { postModifiedPill, getModifiedPills, getProfilePills } = require("../utils/route_generator");
const { createSignedToken } = require("../utils/keycloak_mock");
const { addDays, isEqual } = require("date-fns");
const DateUtils = require("../utils/date_utils");

describe("Pill Routes", ()=>{
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

    if("Return 401 unauthorized with token of other account", async ()=>{
        let account1 = await createAccount();
        let account2 = await createAccount();
        const {profileKey} = await createProfile(account1.accountKey);
        const { pillRoutineKey } = await PillRoutineObjectGenerator.createDayPeriodPillRoutine(
            accountKey, profileKey, 2, ["12:00"]
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
        const { pillRoutineKey } = await PillRoutineObjectGenerator.createDayPeriodPillRoutine(
            accountKey, profileKey, 2, ["12:00", "13:30", "12:00"]
        );

        const today = new Date();
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
        expect(response.body.data.length).toBe(4);

        let pillsToFind = [
            {
                datetime: (new Date(DateUtils.getDateString(today) + "T12:00")).toISOString(),
                quantity: 2
            },
            {
                datetime: (new Date(DateUtils.getDateString(afterTomorrow) + "T12:00")).toISOString(),
                quantity: 2
            },
            {
                datetime: (new Date(DateUtils.getDateString(today) + "T13:30")).toISOString(),
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
        const afterTomorrow = addDays(today, 2);

        let routineData = {};
        routineData[DateUtils.dayNumberToString(today.getDay())] = hoursString;
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
                datetime: (new Date(DateUtils.getDateString(today) + "T12:00")).toISOString(),
                quantity: 2
            },
            {
                datetime: (new Date(DateUtils.getDateString(afterTomorrow) + "T12:00")).toISOString(),
                quantity: 2
            },
            {
                datetime: (new Date(DateUtils.getDateString(today) + "T13:30")).toISOString(),
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
        const afterTomorrow = addDays(today, 2);

        let routineData = {};
        routineData[DateUtils.dayNumberToString(today.getDay())] = ["12:00", "13:30", "12:00"];

        const { pillRoutineKey: weekdaysRoutineKey } = await PillRoutineObjectGenerator.createWeekdaysPillRoutine(
            accountKey, profileKey, routineData
        );
        const { pillRoutineKey: dayPeriodRoutineKey } = await PillRoutineObjectGenerator.createDayPeriodPillRoutine(
            accountKey, profileKey, 3, ["12:00", "13:30", "12:00"]
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
                datetime: (new Date(DateUtils.getDateString(today) + "T12:00")).toISOString(),
                quantity: 2,
                routineKey: weekdaysRoutineKey
            },
            {
                datetime: (new Date(DateUtils.getDateString(today) + "T13:30")).toISOString(),
                quantity: 1,
                routineKey: weekdaysRoutineKey
            },
            {
                datetime: (new Date(DateUtils.getDateString(today) + "T12:00")).toISOString(),
                quantity: 2,
                routineKey: dayPeriodRoutineKey
            },
            {
                datetime: (new Date(DateUtils.getDateString(today) + "T13:30")).toISOString(),
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
        const afterTomorrow = addDays(today, 2);

        let routineData = {};
        routineData[DateUtils.dayNumberToString(today.getDay())] = hoursString;
        routineData[DateUtils.dayNumberToString(afterTomorrow.getDay())] = hoursString;

        const { pillRoutineKey } = await PillRoutineObjectGenerator.createWeekdaysPillRoutine(
            accountKey, profileKey, routineData
        );

        await createModifiedPill(
            accountKey, 
            profileKey, 
            pillRoutineKey, 
            "manualyConfirmed",
            DateUtils.sameDateOtherHour(today, "12:00").toISOString()
        );

        await createModifiedPill(
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
                fromDate: DateUtils.getDateString(today),
                toDate: DateUtils.getDateString(afterTomorrow),
            }
        );

        expect(response.status).toBe(200);
        expect(response.body.data.length).toBe(4);

        let pillsToFind = [
            {
                datetime: (new Date(DateUtils.getDateString(today) + "T12:00")).toISOString(),
                quantity: 2,
                status: "manualyConfirmed"
            },
            {
                datetime: (new Date(DateUtils.getDateString(afterTomorrow) + "T12:00")).toISOString(),
                quantity: 2,
                status: "pending"
            },
            {
                datetime: (new Date(DateUtils.getDateString(today) + "T13:30")).toISOString(),
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
        const { pillRoutineKey } = await PillRoutineObjectGenerator.createDayPeriodPillRoutine(
            accountKey, profileKey, 2, ["12:00", "13:30", "12:00"]
        );

        const today = new Date();
        const afterTomorrow = addDays(today, 2);

        await createModifiedPill(
            accountKey, 
            profileKey, 
            pillRoutineKey, 
            "manualyConfirmed",
            DateUtils.sameDateOtherHour(today, "12:00").toISOString()
        );

        await createModifiedPill(
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
                fromDate: DateUtils.getDateString(today),
                toDate: DateUtils.getDateString(afterTomorrow),
            }
        );

        expect(response.status).toBe(200);
        expect(response.body.data.length).toBe(4);

        let pillsToFind = [
            {
                datetime: (new Date(DateUtils.getDateString(today) + "T12:00")).toISOString(),
                quantity: 2,
                status: "manualyConfirmed"
            },
            {
                datetime: (new Date(DateUtils.getDateString(afterTomorrow) + "T12:00")).toISOString(),
                quantity: 2,
                status: "pending"
            },
            {
                datetime: (new Date(DateUtils.getDateString(today) + "T13:30")).toISOString(),
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
        const afterTomorrow = addDays(today, 2);

        let routineData = {};
        routineData[DateUtils.dayNumberToString(afterTomorrow.getDay())] = ["12:00", "13:30", "12:00"];

        const { pillRoutineKey: weekdaysRoutineKey } = await PillRoutineObjectGenerator.createWeekdaysPillRoutine(
            accountKey, profileKey, routineData
        );
        const { pillRoutineKey: dayPeriodRoutineKey } = await PillRoutineObjectGenerator.createDayPeriodPillRoutine(
            accountKey, profileKey, 3, ["12:00", "13:30", "12:00"]
        );

        await createModifiedPill(
            accountKey, 
            profileKey, 
            weekdaysRoutineKey, 
            "manualyConfirmed",
            DateUtils.sameDateOtherHour(afterTomorrow, "12:00").toISOString()
        );

        await createModifiedPill(
            accountKey, 
            profileKey, 
            dayPeriodRoutineKey, 
            "canceled",
            DateUtils.sameDateOtherHour(today, "13:30").toISOString()
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
                datetime: (new Date(DateUtils.getDateString(today) + "T12:00")).toISOString(),
                quantity: 2,
                routineKey: dayPeriodRoutineKey,
                status: "pending"
            },
            {
                datetime: (new Date(DateUtils.getDateString(today) + "T13:30")).toISOString(),
                quantity: 1,
                routineKey: dayPeriodRoutineKey,
                status: "canceled"
            },
            {
                datetime: (new Date(DateUtils.getDateString(afterTomorrow) + "T12:00")).toISOString(),
                quantity: 2,
                routineKey: weekdaysRoutineKey,
                status: "manualyConfirmed"
            },
            {
                datetime: (new Date(DateUtils.getDateString(afterTomorrow) + "T13:30")).toISOString(),
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
    })
});