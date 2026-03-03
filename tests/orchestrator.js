import retry from "async-retry";
import database from "infra/database";
import migrator from "models/migrator";

async function waitForAllServices() {
  await waitForWebServer();
  async function waitForWebServer() {
    return retry(fetchStatusPage, {
      retries: 100,
      maxTimeout: 1000,
    });

    async function fetchStatusPage() {
      const res = await fetch("http://localhost:3000/api/v1/status");
      if (res.status !== 200) {
        throw new Error("Web server is not ready");
      }
    }
  }
}

async function clearDatabase() {
  await database.query("drop schema public cascade; create schema public;");
}

async function runMigrations() {
  await migrator.runPendingMigrations();
}

const orchestrator = {
  waitForAllServices,
  clearDatabase,
  runMigrations,
};

export default orchestrator;
