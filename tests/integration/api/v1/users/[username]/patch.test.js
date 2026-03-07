import { version as uuidVersion } from "uuid";
import orchestrator from "tests/orchestrator";
import user from "models/user";
import password from "models/password";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.clearDatabase();
  await orchestrator.runMigrations();
});

describe("PATCH /api/v1/users/[username]", () => {
  describe("Anonymous user", () => {
    test("With non-existent 'username'", async () => {
      const response2 = await fetch(
        "http://localhost:3000/api/v1/users/nonExistent",
        {
          method: "PATCH",
        },
      );
      expect(response2.status).toBe(404);

      expect(await response2.json()).toEqual({
        name: "NotFoundError",
        message: "Usuario nao foi encontrado no sistema.",
        action: "Verifique se o username informado esta correto.",
        status_code: 404,
      });
    });

    test("With duplicate 'username'", async () => {
      const user1Response = await fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: "user1",
          password: "password123",
          email: "user1@example.com",
        }),
      });

      expect(user1Response.status).toBe(201);

      const user2Response = await fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: "user2",
          password: "password123",
          email: "user2@example.com",
        }),
      });

      expect(user2Response.status).toBe(201);

      const updateUser = await fetch(
        "http://localhost:3000/api/v1/users/user2",
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            username: "user1",
          }),
        },
      );

      expect(updateUser.status).toBe(400);

      const updateUserBody = await updateUser.json();
      expect(updateUserBody).toEqual({
        name: "ValidationError",
        message: "O nome de usuario informado ja existe.",
        action: "Utilize um nome de usuario diferente.",
        status_code: 400,
      });
    });

    test("With duplicate 'email'", async () => {
      const email1Response = await fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: "email1",
          password: "password123",
          email: "email1@example.com",
        }),
      });

      expect(email1Response.status).toBe(201);

      const email2Response = await fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: "email2",
          password: "password123",
          email: "email2@example.com",
        }),
      });

      expect(email2Response.status).toBe(201);

      const updateUser = await fetch(
        "http://localhost:3000/api/v1/users/email2",
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: "email1@example.com",
          }),
        },
      );

      expect(updateUser.status).toBe(400);

      const updateUserBody = await updateUser.json();
      expect(updateUserBody).toEqual({
        name: "ValidationError",
        message: "O email informado ja existe.",
        action: "Utilize um email diferente.",
        status_code: 400,
      });
    });

    test("With unique 'username'", async () => {
      const user1Response = await fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: "uniqueUser1",
          password: "password123",
          email: "uniqueUser1@example.com",
        }),
      });

      expect(user1Response.status).toBe(201);

      const updateUser = await fetch(
        "http://localhost:3000/api/v1/users/uniqueUser1",
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            username: "uniqueUser2",
          }),
        },
      );

      expect(updateUser.status).toBe(200);

      const updateUserBody = await updateUser.json();
      expect(updateUserBody).toEqual({
        id: updateUserBody.id,
        username: "uniqueUser2",
        password: updateUserBody.password,
        email: "uniqueUser1@example.com",
        created_at: updateUserBody.created_at,
        updated_at: updateUserBody.updated_at,
      });

      expect(uuidVersion(updateUserBody.id)).toBe(4);
      expect(Date.parse(updateUserBody.created_at)).not.toBeNaN();
      expect(Date.parse(updateUserBody.updated_at)).not.toBeNaN();
      expect(updateUserBody.updated_at > updateUserBody.created_at).toBe(true);
    });

    test("With unique 'email'", async () => {
      const user1Response = await fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: "uniqueUser1",
          password: "password123",
          email: "uniqueEmail1@example.com",
        }),
      });

      expect(user1Response.status).toBe(201);

      const updateUser = await fetch(
        "http://localhost:3000/api/v1/users/uniqueUser1",
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: "uniqueEmail2@example.com",
          }),
        },
      );

      expect(updateUser.status).toBe(200);

      const updateUserBody = await updateUser.json();
      expect(updateUserBody).toEqual({
        id: updateUserBody.id,
        username: "uniqueUser1",
        password: updateUserBody.password,
        email: "uniqueEmail2@example.com",
        created_at: updateUserBody.created_at,
        updated_at: updateUserBody.updated_at,
      });

      expect(uuidVersion(updateUserBody.id)).toBe(4);
      expect(Date.parse(updateUserBody.created_at)).not.toBeNaN();
      expect(Date.parse(updateUserBody.updated_at)).not.toBeNaN();
      expect(updateUserBody.updated_at > updateUserBody.created_at).toBe(true);
    });
    test("With new 'password'", async () => {
      const newPasswordResponse = await fetch(
        "http://localhost:3000/api/v1/users",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            username: "newPassword",
            password: "password",
            email: "newPassword@example.com",
          }),
        },
      );

      expect(newPasswordResponse.status).toBe(201);

      const updateUser = await fetch(
        "http://localhost:3000/api/v1/users/newPassword",
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            password: "newPassword",
          }),
        },
      );

      expect(updateUser.status).toBe(200);

      const updateUserBody = await updateUser.json();
      expect(updateUserBody).toEqual({
        id: updateUserBody.id,
        username: "newPassword",
        password: updateUserBody.password,
        email: "newPassword@example.com",
        created_at: updateUserBody.created_at,
        updated_at: updateUserBody.updated_at,
      });

      expect(uuidVersion(updateUserBody.id)).toBe(4);
      expect(Date.parse(updateUserBody.created_at)).not.toBeNaN();
      expect(Date.parse(updateUserBody.updated_at)).not.toBeNaN();
      expect(updateUserBody.updated_at > updateUserBody.created_at).toBe(true);

      const userInDatabase = await user.findOneByUsername("newPassword");
      const correctPasswordMatch = await password.compare(
        "newPassword",
        userInDatabase.password,
      );

      const incorrectPasswordMatch = await password.compare(
        "password",
        userInDatabase.password,
      );

      expect(correctPasswordMatch).toBe(true);
      expect(incorrectPasswordMatch).toBe(false);
    });
  });
});
