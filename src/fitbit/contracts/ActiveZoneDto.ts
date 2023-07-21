interface ActiveZoneDto {
    'activities-active-zone-minutes': ActiveZoneEntryDto[];
}

interface ActiveZoneEntryDto extends ActivityDto {
    value: ZoneMinutesDto;
}

interface ZoneMinutesDto {
    fatBurnActiveZoneMinutes: number;
    cardioActiveZoneMinutes: number;
    // fitbitApp
    activeZoneMinutes: number;
}
