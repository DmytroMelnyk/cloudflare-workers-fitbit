import { describe, expect, it } from 'vitest';
import { FitbitApiClient } from '../src/fitbit/FitbitApiClient';
import '../src/fitbit/contracts/SleepEntryDto';
import '../src/__global';

describe('FitbitApiClient', () => {
    it('should return sleep data', async () => {
        const fibitClient = new FitbitApiClient("");
        // const resp = await worker.fetch(); didn't work
        const resp = await fibitClient.getSleep(new Date(Date.parse("7/17/2023")), new Date(Date.parse("7/18/2023")));
    });
});