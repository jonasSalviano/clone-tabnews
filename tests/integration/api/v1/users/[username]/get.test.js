import { version as uuidVersion } from "uuid";
import orchestrator from "tests/orchestrator";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.clearDatabase();
  await orchestrator.runMigrations();
});

describe("GET /api/v1/users/[username]", () => {
  describe("Anonymous user", () => {
    test("With exact case match", async () => {
      await orchestrator.createUser({
        username: "mesmoCase",
        password: "password123",
        email: "user@example.com",
      });

      const response2 = await fetch(
        "http://localhost:3000/api/v1/users/mesmoCase",
      );
      expect(response2.status).toBe(200);

      const responseBody = await response2.json();

      expect(responseBody).toEqual({
        id: responseBody.id,
        username: "mesmoCase",
        password: responseBody.password,
        email: "user@example.com",
        created_at: responseBody.created_at,
        updated_at: responseBody.updated_at,
      });

      expect(uuidVersion(responseBody.id)).toBe(4);
      expect(Date.parse(responseBody.created_at)).not.toBeNaN();
      expect(Date.parse(responseBody.updated_at)).not.toBeNaN();
    });

    test("With case mismatch", async () => {
      await orchestrator.createUser({
        username: "caseDiff",
        password: "password123",
        email: "casediff@example.com",
      });

      const response2 = await fetch(
        "http://localhost:3000/api/v1/users/casediff",
      );
      expect(response2.status).toBe(200);

      const responseBody = await response2.json();

      expect(responseBody).toEqual({
        id: responseBody.id,
        username: "caseDiff",
        password: responseBody.password,
        email: "casediff@example.com",
        created_at: responseBody.created_at,
        updated_at: responseBody.updated_at,
      });

      expect(uuidVersion(responseBody.id)).toBe(4);
      expect(Date.parse(responseBody.created_at)).not.toBeNaN();
      expect(Date.parse(responseBody.updated_at)).not.toBeNaN();
    });

    test("With non-existent username", async () => {
      const response2 = await fetch(
        "http://localhost:3000/api/v1/users/nonExistent",
      );
      expect(response2.status).toBe(404);

      expect(await response2.json()).toEqual({
        name: "NotFoundError",
        message: "Usuario nao foi encontrado no sistema.",
        action: "Verifique se o username informado esta correto.",
        status_code: 404,
      });
    });
  });
});
