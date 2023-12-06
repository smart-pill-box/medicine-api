import { DayPeriodRoutine } from "./routines/day_period_routine";
import { Routine } from "./routines/routine";
import { WeekdaysRoutine } from "./routines/weekdays_routine";

export default class RoutineFactory{
    static createRoutine(routineType: string): Routine {
        switch (routineType) {
            case "weekdays":
                return new WeekdaysRoutine();
            case "dayPeriod":
                return new DayPeriodRoutine();
            default:
                throw new Error("Deu coco aquiiiii")
        }
    }
}