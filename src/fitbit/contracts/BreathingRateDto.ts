interface BreathingRateDto {
    br: BreathingRateEntryDto[];
}

interface BreathingRateEntryDto {
    dateTime: string;
    value: BrDto;
}

interface BrDto {
    // fitbitApp
    breathingRate: number;
}
