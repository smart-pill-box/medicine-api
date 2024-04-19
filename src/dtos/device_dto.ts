import { Device } from "../models";

export class DeviceDto {
    static toClientResponse(device: Device) {
        const { deviceKey } = device;

        return {
            deviceKey: deviceKey,
						...(device.deviceIp && {deviceIp: device.deviceIp})
        };
    }
}
