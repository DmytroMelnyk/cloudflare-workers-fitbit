interface SleepEntryDto {
    dateOfSleep: string;
    duration: number;
    efficiency: number;
    isMainSleep: boolean;
    startTime: Date;
    endTime: Date;
    levels: SleepLevelsDto;
    minutesAsleep: number;
    minutesAwake: number;
    timeInBed: number;
    type: SleepTypeDto;
}

type SleepStagesSummaryDto = Record<SleepLevelsStagesDto | SleepLevelsClassicDto, SleepStageDto>;

interface SleepLevelsDto {
    summary: SleepStagesSummaryDto;
}

interface SleepStageDto {
    minutes: number;
}

enum SleepTypeDto {
    CLASSIC = "classic",
    STAGES = "stages"
}

enum SleepLevelsStagesDto {
    DEEP = "deep",
    LIGHT = "light",
    REM = "rem",
    WAKE = "wake"
}

enum SleepLevelsClassicDto {
    RESTLESS = "restless",
    ASLEEP = "asleep",
    AWAKE = "awake"
}