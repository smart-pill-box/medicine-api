import { Device } from '../models';
import { FromSchema } from "json-schema-to-ts";
import { createDeviceBodySchema } from "../schemas/device_schemas";
import { NotFoundDevice } from "../errors/custom_errors";
import { QueryRunner } from "typeorm";

export default class DeviceController {
    transaction: QueryRunner;

    constructor(transaction: QueryRunner){
        this.transaction = transaction;
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

    public async createdevice({ deviceKey }: FromSchema<typeof createDeviceBodySchema>): Promise<Device>{

        const newDevice = new Device();
        newDevice.deviceKey = deviceKey;

        await this.transaction.manager.save(newDevice);
        
        return newDevice;
    } 
}