import migrationRunner from "node-pg-migrate";
import { join } from "node:path";
import database from "infra/database";

export default async function migrations(request, response) {
  const dbClient = await database.getNewClient();
  const defaultConfig = {
    dbClient: dbClient,
    dryRun: true,
    dir: join("infra", "migrations"),
    direction: "up",
    verbose: true,
    migrationsTable: "pgmigrations",
  };

  if (request.method === "GET") {
    const pendingMigration = await migrationRunner(defaultConfig);
    await dbClient.end();
    return response.status(201).json(pendingMigration);
  }

  if (request.method === "POST") {
    const migrateMigrations = await migrationRunner({
      ...defaultConfig,
      dryRun: false,
    });

    await dbClient.end();

    if (migrateMigrations.length > 0) {
      return response.status(201).json(migrateMigrations);
    }
    return response.status(200).json(migrateMigrations);
  }

  return response.status(405);
}
