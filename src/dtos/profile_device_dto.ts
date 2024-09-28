
import { profile } from "console";
import { Device, ProfileDevice } from "../models";
import { DevicePillDto } from "./device_pill_dto";

export class ProfileDeviceDto {
    static toClientResponse(profileDevice: ProfileDevice) {

		const devicePills = [];
		profileDevice.device.devicePills

        return {
            deviceKey: profileDevice.device.deviceKey,
			name: profileDevice.name,
			maxPositions: profileDevice.device.maxPositions,
			...(profileDevice.device.deviceIp && {deviceIp: profileDevice.device.deviceIp}),
			...(profileDevice.device?.devicePills && { devicePills: profileDevice.device.devicePills.map( devicePill => DevicePillDto.toClientResponse(devicePill))}),
        };
    }
}
