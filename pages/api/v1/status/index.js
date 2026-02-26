import database from "infra/database.js";
import { InternalServerError } from "infra/errors.js";

async function status(request, response) {
  const updateAt = new Date().toISOString();
  try {
    const version = await database.query("SHOW server_version;");
    const maxConnections = await database.query("SHOW max_connections;");

    const dataBaseName = process.env.POSTGRES_DB;
    const connectionsActive = await database.query({
      text: "SELECT count(*)::int FROM pg_stat_activity WHERE datname = $1;",
      values: [dataBaseName],
    });

    response.status(200).json({
      update_at: updateAt,
      dependencies: {
        database: {
          version_db: version.rows[0].server_version,
          max_connections: parseInt(maxConnections.rows[0].max_connections),
          connections_active: connectionsActive.rows[0].count,
        },
      },
    });
  } catch (error) {
    const publicErrorObject = new InternalServerError({ cause: error });
    console.log(publicErrorObject);
    response.status(500).json(publicErrorObject);
  }
}

export default status;
