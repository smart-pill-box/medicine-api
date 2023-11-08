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

module.exports = {
    createAccountBody,
    createProfileBody
}