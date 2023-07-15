export interface Env {
  ATLAS_APP_KEY: string;
  ATLAS_APP_ID: string;
  FAUNA_KEY: string;
  FAUNA_DOMAIN: string;
  FAUNA_SCHEME: "http" | "https";
  FAUNA_PORT: number;
  WORKER_DATA: KVNamespace;
}
