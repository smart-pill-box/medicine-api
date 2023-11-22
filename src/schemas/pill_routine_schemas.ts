export const createPillRoutineSchema = {
    params: {
        type: "object",
        properties: {
            accountKey: {
                type: "string",
                minLength: 36,
                maxLength: 36
            },
            profileKey: {
                type: "string",
                minLength: 36,
                maxLength: 36
            }
        },
        required: ["accountKey", "profileKey"],
        additionalProperties: false
    } as const,

    body: {
        type: "object",
        properties: {
            pillRoutineType: {
                type: "string",
                minLength: 1,
                maxLength: 50
            },
            name: {
                type: "string",
                minLength: 1,
                maxLength: 255
            },
            pillRoutineData: {
                type: "object"
            }
        },
        required: [
            "pillRoutineType",
            "pillRoutineData",
            "name"
        ],
        additionalProperties: false
    } as const
}