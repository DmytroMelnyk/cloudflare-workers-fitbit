interface CaloriesDto {
    activities_calories: CaloriesEntryDto[];
}

interface CaloriesEntryDto {
    dateTime: string;
    // fitbitApp
    value: number;
}
