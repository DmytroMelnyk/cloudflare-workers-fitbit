import faunadb, { ToInteger } from 'faunadb';

export interface Env {
  ATLAS_APP_KEY: string;
  ATLAS_APP_ID: string;
  FAUNA_KEY: string;
  FAUNA_DOMAIN: string;
  FAUNA_SCHEME: "http" | "https";
  FAUNA_PORT: number;
  WORKER_DATA: KVNamespace;
}

export function createFaunaClient(env: Env) {
  console.log(env.FAUNA_KEY);
  return new faunadb.Client({
    secret: env.FAUNA_KEY ?? "secret",
    endpoint: env.FAUNA_SCHEME + "://" + env.FAUNA_DOMAIN + ":" + env.FAUNA_PORT + "/"
    //headers: { 'X-Fauna-Source': 'fauna-workers' },
  });
}
