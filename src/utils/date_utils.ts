export default class DateUtils {
    static getHourString(datetime: Date): string{
        return `${String(datetime.getHours()).padStart(2, "0")}:${String(datetime.getMinutes()).padStart(2, "0")}`
    }

    static dateStringToDate(dateString: string){
        return new Date(dateString)
    }

    static isDateStringValid(dateString: string){
        return !Number.isNaN(new Date(dateString).getTime());
    }
}