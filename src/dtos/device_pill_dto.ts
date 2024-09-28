
import { Pill } from "../concepts/pill";
import { DevicePill, ModifiedPill, PillRoutine, PillRoutineStatus, Profile } from "../models";
import { DeviceDto } from "./device_dto";

export class DevicePillDto {
    static toClientResponse(devicePill: DevicePill) {

        return {
            pillDatetime: devicePill.pillDatetime.toISOString(),
            position: devicePill.position
        };
    }
}
