interface ActiveZoneDto {
    activities_active_zone_minutes: ActiveZoneEntryDto[];
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
