interface HeartDto {
    activities_heart: HeartEntryDto[];
}

interface HeartEntryDto {
    dateTime: string;
    value: HeartRateDto;
}

interface HeartRateDto {
    // fitbitApp
    restingHeartRate: number;
}
