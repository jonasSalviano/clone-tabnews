import database from "infra/database";
import password from "./password";
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

async function create(userInputValues) {
  await validatUniqueUsername(userInputValues.username);
  await validatUniqueEmail(userInputValues.email);
  await hashPasswordInObject(userInputValues);

  const newUser = await runInsertQuery(userInputValues);
  return newUser;

  async function runInsertQuery(userInputValues) {
    const result = await database.query({
      text: `
        INSERT INTO
          users (username, password, email)
        VALUES
          ($1, $2, $3)
        RETURNING *`,
      values: [
        userInputValues.username,
        userInputValues.password,
        userInputValues.email,
      ],
    });
    return result.rows[0];
  }
}

async function update(username, userInputValues) {
  const userFound = await findOneByUsername(username);

  if ("username" in userInputValues) {
    await validatUniqueUsername(userInputValues.username);
  }

  if ("email" in userInputValues) {
    await validatUniqueEmail(userInputValues.email);
  }

  if ("password" in userInputValues) {
    await hashPasswordInObject(userInputValues);
  }

  const userWithNewValues = { ...userFound, ...userInputValues };

  const updatedUser = await runUpdateQuery(userWithNewValues);
  return updatedUser;

  async function runUpdateQuery(userWithNewValues) {
    const result = await database.query({
      text: `
      UPDATE
        users
      SET
        username = $2,
        email = $3,
        password = $4,
        updated_at = timezone('utc', now())
      WHERE 
        id = $1
      RETURNING 
        *`,
      values: [
        userWithNewValues.id,
        userWithNewValues.username,
        userWithNewValues.email,
        userWithNewValues.password,
      ],
    });
    return result.rows[0];
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

async function hashPasswordInObject(userInputValues) {
  const hashedPassword = await password.hash(userInputValues.password);
  userInputValues.password = hashedPassword;
}

const user = {
  create,
  findOneByUsername,
  update,
};

export default user;
