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
        }
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
            pillRoutineData: routineData
        }
    }

    static createDayPeriodPillRoutineBody(periodInDays=null, pillsTimes=null){
        if (!periodInDays){
            periodInDays = 2;
        }
        if (!pillsTimes){
            pillsTimes = ["12:00"];
        }

        return {
            pillRoutineType: "dayPeriod",
            name: "Test Routine name",
            pillRoutineData:{
                pillsTimes: pillsTimes,
                periodInDays: periodInDays
            }
        }
    }
}

module.exports = {
    createAccountBody,
    createProfileBody,
    createDeviceBody,
    createProfileDeviceBody,
    PillRoutineBodyGenerator
}