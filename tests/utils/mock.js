const { default: axios } = require("axios");

const baseUrl = "http://localhost:1080/mockserver"
const expectationUrl = `${baseUrl}/expectation`

async function createExpectation({
    method,
    path,
    body = null,
    headers = null,
    responseBody = null,
    responseStatus = null
}){
    await axios.put(
        expectationUrl, {
            httpRequest: {
                ...(body && {body: {
                    type: "JSON",
                    json: JSON.stringify(body),
                    mathType: "STRICT"
                }}),
                method: method,
                path: path
            },
            httpResponse: {
                ...(responseBody && {body: responseBody}),
                ...(responseStatus && {statusCode: responseStatus})
            }
        }
    )
}

async function clearMock(){
    await axios.put(
        `${baseUrl}/clear`
    )
}

module.exports = {
    createExpectation,
    clearMock
}