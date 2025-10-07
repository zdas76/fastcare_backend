import app from "./app";
import type { Server } from "http";
import config from "./config";

async function main() {
  const server: Server = app.listen(config.port, () => {
    console.log(`Example app listening on port ${config.port}`);
  });
}

main();
