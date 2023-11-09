import { DayPeriodRoutine } from "./routines/day_period_routine";
import { Routine } from "./routines/routine";
import { WeekdaysRoutine } from "./routines/weekdays_routine";

export default class RoutineFactory{
    static createRoutine(routineType: string, routineData: object): Routine | null {
        switch (routineType) {
            case "weekdays":
                return new WeekdaysRoutine(routineData);
            case "dayPeriod":
                return new DayPeriodRoutine(routineData);
            default:
                return null
        }
    }
}