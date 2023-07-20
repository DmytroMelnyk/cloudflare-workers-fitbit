interface ActiveZoneDto {
    activities_active_zone_minutes: ActiveZoneEntryDto[];
}

interface ActiveZoneEntryDto {
    dateTime: string;
    value: ZoneMinutesDto;
}

interface ZoneMinutesDto {
    fatBurnActiveZoneMinutes: number;
    cardioActiveZoneMinutes: number;
    // fitbitApp
    activeZoneMinutes: number;
}
