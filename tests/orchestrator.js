import retry from "async-retry";
import database from "infra/database";
import migrator from "models/migrator";
import user from "models/user";
import { faker } from "@faker-js/faker";

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

async function createUser(userObj) {
  return await user.create({
    username:
      userObj.username || faker.internet.username().replace(/[_.-]/g, ""),
    email: userObj.email || faker.internet.email(),
    password: userObj.password || "validpassword",
  });
}

const orchestrator = {
  waitForAllServices,
  clearDatabase,
  runMigrations,
  createUser,
};

export default orchestrator;
