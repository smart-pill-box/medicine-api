export abstract class Routine {
    constructor(routineData: object) {}
    
    abstract routineDataSchema: object;
    abstract validateRoutineData(): void;
    
}