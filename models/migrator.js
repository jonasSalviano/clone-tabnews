import { resolve } from "path";
import migrationRunner from "node-pg-migrate";
import database from "infra/database";

const defaultConfig = {
  dryRun: true,
  dir: resolve("infra", "migrations"),
  direction: "up",
  verbose: true,
  migrationsTable: "pgmigrations",
};

let dbClient;

async function listPendingMigrations() {
  try {
    dbClient = await database.getNewClient();

    const pendingMigration = await migrationRunner({
      ...defaultConfig,
      dbClient,
    });

    return pendingMigration;
  } finally {
    await dbClient?.end();
  }
}

async function runPendingMigrations() {
  try {
    dbClient = await database.getNewClient();

    const migrateMigrations = await migrationRunner({
      ...defaultConfig,
      dbClient,
      dryRun: false,
    });

    return migrateMigrations;
  } finally {
    await dbClient?.end();
  }
}

const migrator = {
  listPendingMigrations,
  runPendingMigrations,
};

export default migrator;
