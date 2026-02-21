import orchestrator from "tests/orchestrator";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
});

describe("GET /api/v1/migrations", () => {
  describe("Anonymous user", () => {
    test("Retrieving status system", async () => {
      const res = await fetch("http://localhost:3000/api/v1/status");
      const data = await res.json();
      const parsedUpdateAt = new Date(data.update_at).toISOString();
      expect(data.update_at).toEqual(parsedUpdateAt);

      expect(data.dependencies.database).toHaveProperty("version_db");
      expect(data.dependencies.database).toHaveProperty("max_connections");
      expect(data.dependencies.database).toHaveProperty("connections_active");

      expect(typeof data.dependencies.database.version_db).toBe("string");
      expect(typeof data.dependencies.database.max_connections).toBe("number");
      expect(typeof data.dependencies.database.connections_active).toBe(
        "number",
      );

      expect(data.dependencies.database.max_connections).toEqual(100);
      expect(data.dependencies.database.connections_active).toEqual(1);

      expect(data.dependencies.database.version_db).toMatch(/^\d+(\.\d+)?$/);
    });
  });
});
