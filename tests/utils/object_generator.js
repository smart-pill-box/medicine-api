const { createAccountBody, createProfileBody, createDeviceBody, createProfileDeviceBody, PillRoutineBodyGenerator } =  require("./body_generator");
const { postAccount, postProfile, postDevice, postProfileDevice, postPillRoutine } =  require("./route_generator");


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
        }
    ){
        const body = PillRoutineBodyGenerator.createWeekdaysPillRoutineBody(
            {
                monday, tuesday, wednesday, thursday, friday, saturday, sunday
            }
        );

        const response = await postPillRoutine(accounKey, profileKey, body);

        return response.body;
    }

    static async createDayPeriodPillRoutine(
        accounKey, profileKey,
        periodInDays=null, pillsTimes=null
    ){
        const body = PillRoutineBodyGenerator.createDayPeriodPillRoutineBody(
            periodInDays, pillsTimes
        );
        const response = await postPillRoutine(accounKey, profileKey, body);

        return response;
    }
}

module.exports = {
    createAccount,
    createProfile,
    createDevice,
    createProfileDevice,
    PillRoutineObjectGenerator
}