import { PillRoutine, PillRoutineStatus, Profile } from "../models";
import { DeviceDto } from "./device_dto";

export class PillRoutineDto {
    static toClientResponse(pillRoutine: PillRoutine) {
        const statusEvents = pillRoutine.statusEvents.map((statusEvent)=>{
            return {
                status: statusEvent.status.enumerator,
                eventDatetime: statusEvent.eventDatetime.toISOString()
            }
        })

        return {
            pillRoutineKey: pillRoutine.pillRoutineKey,
            name: pillRoutine.name,
            status: pillRoutine.status.enumerator,
            pillRoutineType: pillRoutine.pillRoutineType.enumerator,
            startDatetime: pillRoutine.startDatetime.toISOString(),
            ...(pillRoutine.expirationDatetime && { expirationDatetime: pillRoutine.expirationDatetime.toISOString() }),
            pillRoutineData: pillRoutine.pillRoutineData,
            statusEvents: statusEvents
        };
    }
}
