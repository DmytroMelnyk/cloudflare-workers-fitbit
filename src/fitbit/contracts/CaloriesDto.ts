interface CaloriesDto {
    'activities-calories': CaloriesEntryDto[];
}

interface CaloriesEntryDto extends ActivityDto {
    // fitbitApp
    value: number;
}
