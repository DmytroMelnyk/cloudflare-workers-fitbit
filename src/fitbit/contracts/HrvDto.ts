interface HrvDto {
    hrv: HrvEntryDto[];
}

interface HrvEntryDto {
    dateTime: string;
    value: RmssdDto;
}

interface RmssdDto {
    // fitbitApp
    dailyRmssd: number;
    deepRmssd: number;
}