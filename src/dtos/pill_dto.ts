import { Pill } from "../concepts/pill";
import { ModifiedPill, PillRoutine, PillRoutineStatus, Profile } from "../models";
import { DeviceDto } from "./device_dto";

export class PillDto {
    static toClientResponse(pill: Pill) {
        const statusEvents = pill.statusEvents.map((statusEvent)=>{
            return {
                status: statusEvent.status.enumerator,
                eventDatetime: statusEvent.eventDatetime.toISOString()
            }
        })

        return {
            status: pill.status,
            statusEvents: statusEvents,
            pillDatetime: pill.pillDatetime.toISOString(),
            quantity: pill.quantity,
            pillRoutineKey: pill.pillRoutineKey
        };
    }
}
