// https://api.fitbit.com/1/user/-/activities/heart/date/today/today/1min.json?timezone=UTC
// https://api.fitbit.com/1/user/-/activities/heart/date/today/1d.json?timezone=UTC
interface HeartIntradayDto {
    'activities-heart-intraday': HeartIntradayEntryDto;
}

interface HeartIntradayEntryDto {
    dataset: HeartIntradayRateDto[];
}

interface HeartIntradayRateDto {
    time: string;
    value: number;
}
