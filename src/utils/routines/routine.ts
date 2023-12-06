import { PillRoutine } from "../../models";

export abstract class Routine {

    abstract routineDataSchema: object;
    abstract validateRoutineData(routineData: any): void;
    abstract getQuantityOfPillsByDatetime(pillDatetime: Date, pillRoutine: PillRoutine): number;
}