interface TempSkinDto {
    tempSkin: TempSkinEntryDto[];
}

interface TempSkinEntryDto extends ActivityDto {
    value: RelativeTempDto;
}

interface RelativeTempDto {
    // fitbitApp
    nightlyRelative: number;
}