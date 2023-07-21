interface HeartDto {
    activities_heart: HeartEntryDto[];
}

interface HeartEntryDto extends ActivityDto {
    value: HeartRateDto;
}

interface HeartRateDto {
    // fitbitApp
    restingHeartRate: number;
}
