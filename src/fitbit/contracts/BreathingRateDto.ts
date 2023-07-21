interface BreathingRateDto {
    br: BreathingRateEntryDto[];
}

interface BreathingRateEntryDto extends ActivityDto {
    value: BrDto;
}

interface BrDto {
    // fitbitApp
    breathingRate: number;
}
