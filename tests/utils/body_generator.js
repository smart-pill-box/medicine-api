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

module.exports = {
    createAccountBody,
    createProfileBody,
    createDeviceBody,
    createProfileDeviceBody
}