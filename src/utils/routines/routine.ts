import { Pill } from "../../concepts/pill";
import { PillRoutine } from "../../models";

export abstract class Routine {

    abstract routineDataSchema: object;
    abstract validateRoutineData(routineData: any): void;
    abstract getQuantityOfPillsByDatetime(pillDatetime: Date, pillRoutine: PillRoutine): number;
    abstract getPillsOrderedByDatetimeAsc(fromDate: Date, toDate: Date, pillRoutine: PillRoutine): Pill[];
}