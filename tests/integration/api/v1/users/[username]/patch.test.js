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
      await orchestrator.createUser({
        username: "user1",
      });

      await orchestrator.createUser({
        username: "user2",
      });

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
      await orchestrator.createUser({
        email: "email1@example.com",
      });

      const createdUser2 = await orchestrator.createUser({
        email: "email2@example.com",
      });

      const updateUser = await fetch(
        `http://localhost:3000/api/v1/users/${createdUser2.username}`,
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
      const uniqueUser = await orchestrator.createUser({});

      const updateUser = await fetch(
        `http://localhost:3000/api/v1/users/${uniqueUser.username}`,
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
        email: uniqueUser.email,
        created_at: updateUserBody.created_at,
        updated_at: updateUserBody.updated_at,
      });

      expect(uuidVersion(updateUserBody.id)).toBe(4);
      expect(Date.parse(updateUserBody.created_at)).not.toBeNaN();
      expect(Date.parse(updateUserBody.updated_at)).not.toBeNaN();
      expect(updateUserBody.updated_at > updateUserBody.created_at).toBe(true);
    });

    test("With unique 'email'", async () => {
      const uniqueEmail = await orchestrator.createUser({});

      const updateUser = await fetch(
        `http://localhost:3000/api/v1/users/${uniqueEmail.username}`,
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
        username: uniqueEmail.username,
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
      const newPassword = await orchestrator.createUser({});

      const updateUser = await fetch(
        `http://localhost:3000/api/v1/users/${newPassword.username}`,
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
        username: newPassword.username,
        password: updateUserBody.password,
        email: newPassword.email,
        created_at: updateUserBody.created_at,
        updated_at: updateUserBody.updated_at,
      });

      expect(uuidVersion(updateUserBody.id)).toBe(4);
      expect(Date.parse(updateUserBody.created_at)).not.toBeNaN();
      expect(Date.parse(updateUserBody.updated_at)).not.toBeNaN();
      expect(updateUserBody.updated_at > updateUserBody.created_at).toBe(true);

      const userInDatabase = await user.findOneByUsername(newPassword.username);
      console.log(updateUserBody.password);
      console.log(userInDatabase.password);
      const correctPasswordMatch = await password.compare(
        "newPassword",
        userInDatabase.password,
      );

      const incorrectPasswordMatch = await password.compare(
        newPassword.password,
        userInDatabase.password,
      );

      expect(correctPasswordMatch).toBe(true);
      expect(incorrectPasswordMatch).toBe(false);
    });
  });
});
