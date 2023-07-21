interface HrvDto {
    hrv: HrvEntryDto[];
}

interface HrvEntryDto extends ActivityDto {
    value: RmssdDto;
}

interface RmssdDto {
    // fitbitApp
    dailyRmssd: number;
    deepRmssd: number;
}