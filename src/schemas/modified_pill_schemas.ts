export const createModifiedPillSchema = {
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
            },
            pillRoutineKey: {
                type: "string",
                minLength: 36,
                maxLength: 36
            }
        },
        required: ["accountKey", "profileKey", "pillRoutineKey"],
        additionalProperties: false
    } as const,

    body: {
        type: "object",
        properties: {
            status: {
                type: "string",
                minLength: 1,
                maxLength: 50
            },
            pillDatetime: {
                type: "string",
                pattern: "^\\d{4}-\\d{2}-\\d{2}[T ]\\d{2}:\\d{2}:00\\.000Z$",
                minLength: 24,
                maxLength: 24
            }
        },
        required: [
            "status",
            "pillDatetime"
        ],
        additionalProperties: false
    } as const,

    headers: {
        type: "object",
        properties: {
            authorization: {
                type: "string"
            }
        },
        required: [
            "authorization"
        ]
    } as const
}