import migrationRunner from "node-pg-migrate";
import { join } from "node:path";
import database from "infra/database";

export default async function migrations(request, response) {
  const methodsAllowed = ["GET", "POST"];
  const methodCurrent = request.method;

  if (!methodsAllowed.includes(methodCurrent)) {
    return response.status(405).json({ error: "Method not Allowed" });
  }

  let dbClient;

  try {
    dbClient = await database.getNewClient();
    const defaultConfig = {
      dbClient: dbClient,
      dryRun: true,
      dir: join("infra", "migrations"),
      direction: "up",
      verbose: true,
      migrationsTable: "pgmigrations",
    };

    if (methodCurrent === "GET") {
      const pendingMigration = await migrationRunner(defaultConfig);
      return response.status(201).json(pendingMigration);
    }

    if (methodCurrent === "POST") {
      const migrateMigrations = await migrationRunner({
        ...defaultConfig,
        dryRun: false,
      });

      if (migrateMigrations.length > 0) {
        return response.status(201).json(migrateMigrations);
      }
      return response.status(200).json(migrateMigrations);
    }
  } catch (error) {
    console.log(error);
    throw error;
  } finally {
    await dbClient.end();
  }
}
