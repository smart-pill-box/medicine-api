import { Device } from '../models';
import { FromSchema } from "json-schema-to-ts";
import { createDeviceSchema, updateDeviceIpSchema } from "../schemas/device_schemas";
import { NotFoundDevice } from "../errors/custom_errors";
import { QueryRunner } from "typeorm";

export default class DeviceController {
    transaction: QueryRunner;

    constructor(transaction: QueryRunner){
        this.transaction = transaction;
    }

    public async pooling(deviceKey: string): Promise<Device> {
        const device = await this.transaction.manager.findOne(Device, {
            where: {
                deviceKey: deviceKey
            }
        });

        if (!device) {
            throw new NotFoundDevice(deviceKey);
        }

        device.lastPoolingDatetime = new Date();

        await this.transaction.manager.save(device);

        return device;
    }

    public async getDevice(deviceKey: string): Promise<Device>{

        const device = await this.transaction.manager.findOne(Device, {
            where: {
                deviceKey: deviceKey
            }
        });

        if (!device) {
            throw new NotFoundDevice(deviceKey);
        }

        return device;
    }

    public async createDevice({ deviceKey, maxPositions }: FromSchema<typeof createDeviceSchema.body>): Promise<Device>{

        const newDevice = new Device();
        newDevice.deviceKey = deviceKey;
		newDevice.maxPositions = maxPositions;
        newDevice.lastPoolingDatetime = new Date("1970-01-01 00:00:00")

        await this.transaction.manager.save(newDevice);
        
        return newDevice;
    } 

    public async updateIp(deviceKey: string, { deviceIp }: FromSchema<typeof updateDeviceIpSchema.body>): Promise<Device> {
        const device = await this.transaction.manager.findOne(Device, {
            where: {
                deviceKey: deviceKey
            }
        });

        if (!device) {
            throw new NotFoundDevice(deviceKey);
        }

        device.deviceIp = deviceIp;

        await this.transaction.manager.save(device);

        return device;
    }
}
