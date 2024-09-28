
import { Device, DevicePill, ModifiedPill, ModifiedPillStatus, ModifiedPillStatusEvent } from '../models';
import { FromSchema } from "json-schema-to-ts";
import { createDeviceSchema, updateDeviceIpSchema } from "../schemas/device_schemas";
import { NotFoundDevice, NotFoundDevicePill } from "../errors/custom_errors";
import { QueryRunner } from "typeorm";
import { createDevicePillSchema, updateDevicePillStatusSchema } from '../schemas/device_pill_schemas';

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

    public async updateDevicePillStatus(deviceKey, devicePillKey, {
        status,
    }: FromSchema<typeof updateDevicePillStatusSchema.body>): Promise<DevicePill>{
        const devicePill = await this.transaction.manager.findOne(DevicePill, {
            where: {
                devicePillKey: devicePillKey,
                device: {
                    deviceKey: deviceKey
                }
            }
        });

        if(!devicePill){
            throw new NotFoundDevicePill();
        }

        const modifiedPill = await this.transaction.manager.findOne(ModifiedPill, {
            where: {
                devicePill: {
                    devicePillKey: devicePillKey
                }
            }
        });

        if(!modifiedPill){
            return devicePill;
        }

        // TODO talvez conferir se o status é remarcado ou seila
        const modifiedPillStatus = await this.transaction.manager.findOne(ModifiedPillStatus, {
            where: {
                enumerator: "pillBoxConfirmed"
            }
        }) as ModifiedPillStatus;

        const modifiedPillStatusEvent = new ModifiedPillStatusEvent();
        modifiedPillStatusEvent.status = modifiedPillStatus;
        modifiedPillStatusEvent.eventDatetime = new Date();

        modifiedPill.status = modifiedPillStatus;
        modifiedPill.statusEvents.push(modifiedPillStatusEvent);

        await this.transaction.manager.save(modifiedPill);

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
