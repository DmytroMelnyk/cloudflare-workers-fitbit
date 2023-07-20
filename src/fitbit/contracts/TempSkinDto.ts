interface TempSkinDto {
    tempSkin: TempSkinEntryDto[];
}

interface TempSkinEntryDto {
    value: RelativeTempDto;
    dateTime: string;
}

interface RelativeTempDto {
    // fitbitApp
    nightlyRelative: number;
}