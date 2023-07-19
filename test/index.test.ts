import { unstable_dev } from 'wrangler';
import type { UnstableDevWorker } from 'wrangler';
import { describe, expect, it, beforeAll, afterAll } from 'vitest';

describe('Worker', () => {
    let worker: UnstableDevWorker;

    beforeAll(async () => {
        worker = await unstable_dev('src/index.ts', { env: "dev", local: true }, { disableExperimentalWarning: true });
    });

    afterAll(async () => {
        await worker.stop();
    });

    it('root should return 302 response', async () => {
        const req = new Request(`http://${worker.address}:${worker.port}/`, { method: 'GET' });
        // const resp = await worker.fetch(); didn't work
        const resp = await fetch(req.url, { redirect: 'manual' });
        expect(resp.status).toBe(302);

        const text = await resp.text();
        expect(text).empty;
    });
});