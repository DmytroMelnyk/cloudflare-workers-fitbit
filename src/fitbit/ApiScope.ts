// A Fitbit developer’s personal Intraday data is automatically available through the “Personal” application type. You do not need to submit a request.
export enum ApiScope {
    //Includes activity data and exercise log related features, such as steps, distance, calories burned, and active minutes.
    ACTIVITY = "activity",
    //Includes the maximum or optimum rate at which the user’s heart, lungs, and muscles can effectively use oxygen during exercise.
    CARDIO_FITNESS = "cardio_fitness",
    //Includes the user's on-device ECG readings.
    ELECTROCARDIOGRAM = "electrocardiogram",
    //Includes the continuous heart rate data and related analysis.	
    HEARTRATE = "heartrate",
    //Includes the GPS and other location data.
    LOCATION = "location",
    //Includes calorie consumption and nutrition related features, such as food/water logging, goals, and plans.
    NUTRITION = "nutrition",
    //Includes measurements of blood oxygen level.
    OXYGEN_SATURATION = "oxygen_saturation",
    //Includes basic user information.
    PROFILE = "profile",
    //Includes measurements of average breaths per minute at night.
    RESPIRATORY_RATE = "respiratory_rate",
    //Includes user account and device settings, such as alarms.
    SETTINGS = "settings",
    //Includes sleep logs and related sleep analysis.
    SLEEP = "sleep",
    //Includes friend-related features, such as friend list and leaderboard.
    SOCIAL = "social",
    //Includes skin and core temperature data.
    TEMPERATURE = "temperature",
    //Includes weight and body fat information, such as body mass index, body fat percentage, and goals.
    WEIGHT = "weight",
}
