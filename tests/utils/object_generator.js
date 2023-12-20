const { createAccountBody, createProfileBody, createDeviceBody, createProfileDeviceBody, PillRoutineBodyGenerator, createUpdatePillBody, createPillReeschaduleBody, createUpdatePillRoutineBody } =  require("./body_generator");
const { postAccount, postProfile, postDevice, postProfileDevice, postPillRoutine, putPillStatus, postPillReeschadule, putPillRoutine } =  require("./route_generator");


async function createAccount(mainProfileName=null){
    const body = createAccountBody(mainProfileName);
    const response = await postAccount(body);

    expect(response.status).toBe(201);

    return response.body;
};

async function createProfile(accountKey, name=null){
    const body = createProfileBody(accountKey, name);
    const response = await postProfile(accountKey, body);

    expect(response.status).toBe(201)

    return response.body;
};

async function createDevice(deviceKey=null){
    const body = createDeviceBody(deviceKey);
    const response = await postDevice(body);

    expect(response.status).toBe(201);

    return response.body;
};

async function createProfileDevice(accountKey, profileKey, deviceKey){
    const body = createProfileDeviceBody(deviceKey);
    const response = await postProfileDevice(accountKey, profileKey, body);

    expect(response.status).toBe(201);

    return response.body;
};

class PillRoutineObjectGenerator{
    static async createWeekdaysPillRoutine(
        accounKey, profileKey,
        {
            monday=null,
            tuesday=null,
            wednesday=null,
            thursday=null,
            friday=null,
            saturday=null,
            sunday=null
        },
        startDatetime=null,
        expirationDatetime=null
    ){
        const body = PillRoutineBodyGenerator.createWeekdaysPillRoutineBody(
            {
                monday, tuesday, wednesday, thursday, friday, saturday, sunday
            }, startDatetime, expirationDatetime
        );

        const response = await postPillRoutine(accounKey, profileKey, body);
        expect(response.status).toBe(201);

        return response.body;
    }

    static async createDayPeriodPillRoutine(
        accounKey, profileKey,
        periodInDays=null, pillsTimes=null, startDatetime=null, expirationDatetime=null
    ){
        const body = PillRoutineBodyGenerator.createDayPeriodPillRoutineBody(
            periodInDays, pillsTimes, startDatetime
        );
        const response = await postPillRoutine(accounKey, profileKey, body);

        expect(response.status).toBe(201);

        return response.body;
    }
}

async function updatePillStatus(accountKey, profileKey, pillRoutineKey, status, pillDatetime){
    const body = createUpdatePillBody(status);

    const response = await putPillStatus(accountKey, profileKey, pillRoutineKey, pillDatetime, body);

    expect(response.status).toBe(201);

    return response.body;
}

async function createPillReeschadule(accountKey, profileKey, pillRoutineKey, pillDatetime, newPillDatetime){
    const body = createPillReeschaduleBody(newPillDatetime);

    const response = await postPillReeschadule(accountKey, profileKey, pillRoutineKey, pillDatetime, body);

    expect(response.status).toBe(201);

    return response.body;
}

async function updatePillRoutine(
    accounKey, 
    profileKey, 
    pillRoutineKey, 
    pillRoutineType=null,
    pillRoutineData=null,
    startDatetime=null,
    expirationDatetime=null,
){
    const body = createUpdatePillRoutineBody(pillRoutineType, pillRoutineData, startDatetime, expirationDatetime);
    const response = await putPillRoutine(accounKey, profileKey, pillRoutineKey, body);

    expect(response.status).toBe(201);

    return response.body
}

module.exports = {
    createAccount,
    createProfile,
    createDevice,
    createProfileDevice,
    PillRoutineObjectGenerator,
    updatePillStatus,
    createPillReeschadule,
    updatePillRoutine,
}