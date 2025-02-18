
import { Device, DevicePill, ModifiedPill, ModifiedPillStatus, ModifiedPillStatusEvent } from '../models';
import { FromSchema } from "json-schema-to-ts";
import { createDeviceSchema, updateDeviceIpSchema } from "../schemas/device_schemas";
import { NotFoundDevice, NotFoundDevicePill } from "../errors/custom_errors";
import { QueryRunner } from "typeorm";
import { createDevicePillSchema} from '../schemas/device_pill_schemas';

export default class DevicePillController {
    transaction: QueryRunner;

    constructor(transaction: QueryRunner){
        this.transaction = transaction;
    }

    public async createDevicePill(deviceKey: string, {
				pillDatetime,
				position,
				devicePillKey,
		}: FromSchema<typeof createDevicePillSchema.body>): Promise<DevicePill>{
        const device = await this.transaction.manager.findOne(Device, {
            where: {
                deviceKey: deviceKey
            }
        });

        if (!device) {
            throw new NotFoundDevice(deviceKey);
        }

		const devicePill = new DevicePill();
		devicePill.position = position;
		devicePill.pillDatetime = new Date(pillDatetime);
		devicePill.device = device;
		devicePill.devicePillKey = devicePillKey;

		await this.transaction.manager.save(devicePill);
        return devicePill;
    }

    public async getDevicePills(deviceKey: string): Promise<DevicePill[]>{

        const device = await this.transaction.manager.findOne(Device, {
            where: {
                deviceKey: deviceKey
            },
			relations: {
				devicePills: {
					modifiedPill: true	
				}
			}
        });

        if (!device) {
            throw new NotFoundDevice(deviceKey);
        }

        return device.devicePills;
    } 
}
