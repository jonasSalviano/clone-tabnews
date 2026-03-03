import database from "infra/database";
import { ValidationError, NotFoundError } from "infra/errors";

async function findOneByUsername(username) {
  const userFound = await runSelectQuery(username);

  return userFound;

  async function runSelectQuery(username) {
    const result = await database.query({
      text: `
      SELECT
        *
      FROM
        users
      WHERE
        LOWER(username) = LOWER($1)
      LIMIT 1`,
      values: [username],
    });

    if (result.rowCount === 0) {
      throw new NotFoundError({
        message: "Usuario nao foi encontrado no sistema.",
        action: "Verifique se o username informado esta correto.",
      });
    }

    return result.rows[0];
  }
}

async function create(userInputValue) {
  await validatUniqueEmail(userInputValue.email);
  await validatUniqueUsername(userInputValue.username);

  const newUser = await runInsertQuery(userInputValue);
  return newUser;

  async function validatUniqueEmail(email) {
    const result = await database.query({
      text: `
      SELECT
        *
      FROM
        users
      WHERE
        LOWER(email) = LOWER($1)`,
      values: [email],
    });
    if (result.rows.length > 0) {
      throw new ValidationError({
        message: "O email informado ja existe.",
        action: "Utilize um email diferente.",
      });
    }
  }

  async function validatUniqueUsername(username) {
    const usernameResult = await database.query({
      text: `
      SELECT
        *
      FROM
        users
      WHERE
        LOWER(username) = LOWER($1)`,
      values: [username],
    });
    if (usernameResult.rows.length > 0) {
      throw new ValidationError({
        message: "O nome de usuario informado ja existe.",
        action: "Utilize um nome de usuario diferente.",
      });
    }
  }

  async function runInsertQuery(userInputValue) {
    const result = await database.query({
      text: `
        INSERT INTO
          users (username, password, email)
        VALUES
          ($1, $2, $3)
        RETURNING *`,
      values: [
        userInputValue.username,
        userInputValue.password,
        userInputValue.email,
      ],
    });
    return result.rows[0];
  }
}

const user = {
  create,
  findOneByUsername,
};

export default user;
