export default class DateUtils {
    static getHourString(datetime: Date): string{
        return `${String(datetime.getHours()).padStart(2, "0")}:${String(datetime.getMinutes()).padStart(2, "0")}`
    }

    static getDateString(datetime: Date){
        return `${datetime.getFullYear()}-${datetime.getMonth()}-${datetime.getDate()}`;
    }

    static dateStringToDate(dateString: string){
        return new Date(dateString)
    }

    static isDateStringValid(dateString: string){
        return !Number.isNaN(new Date(dateString).getTime());
    }

    static dayNumberToString(dayNumber: number){
        const dayNumberToString: {[key: number]: string} = {
            0: "sunday",
            1: "monday",
            2: "tuesday",
            3: "wednesday",
            4: "thursday",
            5: "friday",
            6: "saturday"
        };

        return dayNumberToString[dayNumber];
    }

    static sameDateOtherHour(datetime: Date, hourString: String){
        const date = new Date(
            datetime.getUTCFullYear(),
            datetime.getUTCMonth(),
            datetime.getUTCDate(),
            parseInt(hourString.split(":")[0]),
            parseInt(hourString.split(":")[1]),
            0,
            0
        );

        return date;
    }
}