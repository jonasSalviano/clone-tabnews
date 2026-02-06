import database from "infra/database";
import orchestrator from "tests/orchestrator";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await database.query("drop schema public cascade; create schema public;");
});

test("POST /api/v1/migrations should returns 201", async () => {
  const res = await fetch("http://localhost:3000/api/v1/migrations", {
    method: "POST",
  });
  expect(res.status).toBe(201);
  const responseBody = await res.json();
  expect(Array.isArray(responseBody)).toBe(true);

  const res2 = await fetch("http://localhost:3000/api/v1/migrations", {
    method: "POST",
  });
  expect(res2.status).toBe(200);
  const responseBody2 = await res2.json();
  expect(Array.isArray(responseBody2)).toBe(true);

  const verify = await database.query("SELECT * FROM pgmigrations;");
  expect(verify.rows.length).toBe(1);
});
