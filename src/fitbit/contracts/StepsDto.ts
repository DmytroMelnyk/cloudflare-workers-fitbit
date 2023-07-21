interface StepsDto {
    activities_steps: StepsEntryDto[];
}

interface StepsEntryDto extends ActivityDto {
    value: number;
}
