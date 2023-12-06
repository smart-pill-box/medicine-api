import { ModifiedPill, PillRoutine, PillRoutineStatus, Profile } from "../models";
import { DeviceDto } from "./device_dto";

export class ModifiedPillDto {
    static toClientResponse(modifiedPill: ModifiedPill) {
        const statusEvents = modifiedPill.statusEvents.map((statusEvent)=>{
            return {
                status: statusEvent.status.enumerator,
                eventDatetime: statusEvent.eventDatetime.toISOString()
            }
        })

        return {
            status: modifiedPill.status.enumerator,
            statusEvents: statusEvents,
            pillDatetime: modifiedPill.pillDatetime.toISOString(),
            quantity: modifiedPill.quantity,
            ...(modifiedPill.confirmationDatetime ? { confirmationDatetime: modifiedPill.confirmationDatetime }: {}),
        };
    }
}
