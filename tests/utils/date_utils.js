class DateUtils {
    static getDateString(datetime){
        return datetime.toISOString().split("T")[0];
    }

    static dayNumberToString(dayNumber){
        const tradutor = {
            0: "sunday",
            1: "monday",
            2: "tuesday",
            3: "wednesday",
            4: "thursday",
            5: "friday",
            6: "saturday"
        };

        return tradutor[dayNumber];
    }

    static sameDateOtherHour(datetime, hourString){
        const dateString = DateUtils.getDateString(datetime);

        return new Date(dateString + "T" + hourString);
    }
}

module.exports = DateUtils