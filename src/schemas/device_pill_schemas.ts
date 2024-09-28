
export const createDevicePillSchema = { params: {
		type: "object",
		properties: {
			deviceKey: {
				type: "string",
				minLength: 36,
				maxLength: 36
			}
		},
		required: [
			"deviceKey"
		]
	} as const,
	body: {
		type: "object",
		properties: {
			pillDatetime: {
				type: "string",
			},
			position: {
				type: "integer",
				minimum: 0
			},
			devicePillKey: {
				type: "string",
				minLength: 36,
				maxLength: 36
			}
		},
		required: [
			"pillDatetime",
			"position",
			"devicePillKey"
		],
		additionalProperties: false
	} as const
}

export const getDevicePillsSchema = {
	params: {
		type: "object",
		properties: {
			deviceKey: {
				type: "string",
				minLength: 36,
				maxLength: 36
			}
		},
		required: ["deviceKey"],
		additionalProperties: false
	} as const,
}


export const updateDevicePillStatusSchema = { 
    params: {
		type: "object",
		properties: {
			deviceKey: {
				type: "string",
				minLength: 36,
				maxLength: 36
			},
            devicePillKey: {
                type: "string",
                minLength: 36,
                maxLength: 36
            },
		},
		required: [
			"deviceKey",
            "devicePillKey"
		]
	} as const,
	body: {
		type: "object",
		properties: {
			status: {
				type: "string",
				minLength: 1,
				maxLength: 50
			}
		},
		required: [
			"status"
		],
		additionalProperties: false
	} as const
}

