import { createRouter } from "next-connect";
import migrationRunner from "node-pg-migrate";
import { resolve } from "node:path";
import database from "infra/database";
import controller from "infra/controller";

const router = createRouter();

router.get(getHandle).post(postHandle);

export default router.handler(controller.errorHandlers);

let dbClient;
const defaultConfig = {
  dbClient: dbClient,
  dryRun: true,
  dir: resolve("infra", "migrations"),
  direction: "up",
  verbose: true,
  migrationsTable: "pgmigrations",
};

async function getHandle(request, response) {
  try {
    dbClient = await database.getNewClient();

    const pendingMigration = await migrationRunner({
      ...defaultConfig,
      dbClient,
    });

    return response.status(201).json(pendingMigration);
  } finally {
    await dbClient.end();
  }
}

async function postHandle(request, response) {
  try {
    dbClient = await database.getNewClient();

    const migrateMigrations = await migrationRunner({
      ...defaultConfig,
      dbClient,
      dryRun: false,
    });

    if (migrateMigrations.length > 0) {
      return response.status(201).json(migrateMigrations);
    }
    return response.status(200).json(migrateMigrations);
  } finally {
    await dbClient.end();
  }
}
