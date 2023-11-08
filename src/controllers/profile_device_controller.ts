import { QueryRunner } from "typeorm";
import { FromSchema } from "json-schema-to-ts";
import { Account, Profile, Device, ProfileDevice } from "../models";
import { v4 as uuidv4 } from "uuid"
import { NotFoundAccount, NotFoundDevice, NotFoundProfile } from "../errors/custom_errors";
import { createProfileDeviceSchema } from "../schemas/profile_device_schemas";

export default class ProfileDeviceController {
    transaction: QueryRunner;

    constructor(transaction: QueryRunner){
        this.transaction = transaction;
    }

    public async createProfileDevice(accountKey: string, profileKey: string,
    { 
        deviceKey
    }: FromSchema<typeof createProfileDeviceSchema.body> ) {
        const device = await this.transaction.manager.findOne(Device, {
            where: {
                deviceKey: deviceKey
            }
        })

        if (!device){
            throw new NotFoundDevice(deviceKey);
        }

        const profile = await this.transaction.manager.findOne(Profile, {
            where: {
                profileKey: profileKey,
                account: {
                    accountKey: accountKey
                }
            },
            relations:{
                account: true
            }
        });

        if (!profile){
            throw new NotFoundProfile(accountKey, profileKey);
        }

        const profileDevice = new ProfileDevice();
        profileDevice.profile = profile;
        profileDevice.device = device;

        this.transaction.manager.save(profileDevice);

    }
}