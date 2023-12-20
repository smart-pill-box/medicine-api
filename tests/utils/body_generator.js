const { v4 : uuidv4 } = require("uuid")

function createAccountBody(mainProfileName=null){
    if (!mainProfileName){
        mainProfileName = "test main profile name";
    }
    return {
        mainProfileName: mainProfileName
    }
};

function createProfileBody(name=null){
    if (!name){
        name = "test profile name";
    }
    return {
        name: name
    }
};

function createDeviceBody(deviceKey=null){
    if(!deviceKey){
        deviceKey = uuidv4();
    }

    return {
        deviceKey: deviceKey
    }
};

function createProfileDeviceBody(deviceKey){
    return {
        deviceKey: deviceKey
    }
};

class PillRoutineBodyGenerator{
    static createWeekdaysPillRoutineBody(
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
        expirationDatetime=null,
    ){
        let routineData = {
            ...(monday !== null && { monday: monday }),
            ...(tuesday !== null && { tuesday: tuesday }),
            ...(wednesday !== null && { wednesday: wednesday }),
            ...(thursday !== null && { thursday: thursday }),
            ...(friday !== null && { friday: friday }),
            ...(saturday !== null && { saturday: saturday }),
            ...(sunday !== null && { sunday: sunday }),
        };

        return {
            pillRoutineType: "weekdays",
            name: "Test Routine name",
            pillRoutineData: routineData,
            ...(startDatetime !== null && { startDatetime: startDatetime }),
            ...(expirationDatetime !== null && { expirationDatetime: expirationDatetime }),
        }
    }

    static createDayPeriodPillRoutineBody(periodInDays=null, pillsTimes=null, startDatetime=null, expirationDatetime=null){
        if (!periodInDays){
            periodInDays = 2;
        }
        if (!pillsTimes){
            pillsTimes = ["12:00"];
        }

        return {
            pillRoutineType: "dayPeriod",
            name: uuidv4(),
            pillRoutineData:{
                pillsTimes: pillsTimes,
                periodInDays: periodInDays
            },
            ...(startDatetime !== null && { startDatetime: startDatetime }),
            ...(expirationDatetime !== null && { expirationDatetime: expirationDatetime }),
        }
    }
};

function createUpdatePillBody(status, pillDatetime){
    return {
        status: status,
        pillDatetime: pillDatetime
    }
};

function createPillReeschaduleBody(newPillDatetime){
    return {
        newPillDatetime: newPillDatetime
    }
};

function createUpdatePillRoutineBody(
    pillRoutineType=null,
    pillRoutineData=null,
    startDatetime=null,
    expirationDatetime=null,
){
    return {
        ...(pillRoutineType !== null && { pillRoutineType: pillRoutineType }),
        ...(pillRoutineData !== null && { pillRoutineData: pillRoutineData }),
        ...(startDatetime !== null && { startDatetime: startDatetime }),
        ...(expirationDatetime !== null && { expirationDatetime: expirationDatetime }),
    }
}

module.exports = {
    createAccountBody,
    createProfileBody,
    createDeviceBody,
    createProfileDeviceBody,
    PillRoutineBodyGenerator,
    createUpdatePillBody,
    createPillReeschaduleBody,
    createUpdatePillRoutineBody,
}