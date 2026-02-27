import orchestrator from "tests/orchestrator";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
});

describe("POST /api/v1/status", () => {
  describe("Anonymous user", () => {
    test("Retrieving status system", async () => {
      const res = await fetch("http://localhost:3000/api/v1/status", {
        method: "POST",
      });
      expect(res.status).toBe(405);
      const resBody = await res.json();
      expect(resBody).toEqual({
        name: "MethodNotAllowed",
        message: "Metodo nao permitido para este endpoint.",
        action:
          "Verifique se o metodo HTTP enviado e valido para este endpoint.",
        status_code: 405,
      });
    });
  });
});
