interface CaloriesDto {
    activities_calories: CaloriesEntryDto[];
}

interface CaloriesEntryDto extends ActivityDto {
    // fitbitApp
    value: number;
}
