export abstract class Routine {
    routineData: object;
    
    constructor(routineData: object) {
        this.routineData = routineData;
    }
    
    abstract routineDataSchema: object;
    abstract validateRoutineData(): void;
    
}