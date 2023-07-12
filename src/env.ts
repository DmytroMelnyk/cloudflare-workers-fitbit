import faunadb, { ToInteger } from 'faunadb';

export interface Env {
  FAUNA_KEY: string;
  FAUNA_DOMAIN: string;
  FAUNA_SCHEME: "http" | "https";
  FAUNA_PORT: number;
  WORKER_DATA: KVNamespace;
}

export function createFaunaClient(env: Env) {
  console.log(env.FAUNA_DOMAIN);
  return new faunadb.Client({
    secret: env.FAUNA_KEY ?? "secret",
    endpoint: env.FAUNA_SCHEME + "://" + env.FAUNA_DOMAIN + ":" + env.FAUNA_PORT + "/"
    //headers: { 'X-Fauna-Source': 'fauna-workers' },
  });
}
