import { Device } from "../models";

export class DeviceDto {
    static toClientResponse(device: Device) {
        const { deviceKey, lastPoolingDatetime } = device;

        return {
            deviceKey: deviceKey,
            lastPoolingDatetime: lastPoolingDatetime.toISOString(),
			...(device.deviceIp && {deviceIp: device.deviceIp}),
        };
    }
}
