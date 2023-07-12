## Good sources:

https://github.com/fauna-labs/fauna-workers
https://github.com/cloudflare/miniflare-typescript-esbuild-jest
https://github.com/cloudflare/itty-router-openapi
https://itty.dev/itty-router/typescript#uniform-routers
https://github.com/cloudflare/workers-sdk/tree/main/templates/worker-openapi
https://github.com/tsndr/cloudflare-worker-router
https://duck.brainy.sh/#/?id=getting-started


## Lerna (monorepo)
https://developers.cloudflare.com/workers/tutorials/manage-projects-with-lerna/

## How to run
1. Open as dev container in VS Code
1. Create database Products:
11. Go to Fauna extension in the VS Code
11. Press Create button and select collection
11. Name collection as Products

# list all installed packages
npm ll

# install all packages
npm install


npx brainyduck --domain localhost --port 8443 --scheme http --graphql-domain localhost --graphql-port 8084

npx wrangler kv:namespace create fitbit --preview
npx wrangler tail fitbit-worker-production
