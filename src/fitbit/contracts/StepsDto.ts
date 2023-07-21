interface StepsDto {
    'activities-steps': StepsEntryDto[];
}

interface StepsEntryDto extends ActivityDto {
    value: number;
}
