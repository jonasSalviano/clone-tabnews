import user from "models/user";
import password from "models/password";
import { NotFoundError, UnathorizedError } from "infra/errors";

async function getAuthenticatedUser(providedEmail, providedPassword) {
  try {
    const storedUser = await findUserByEmail(providedEmail);
    await validatePassword(providedPassword, storedUser.password);
    return storedUser;
  } catch (error) {
    if (error instanceof UnathorizedError) {
      throw new UnathorizedError({
        message: "Dados de autenticacao nao conferem.",
        action: "Verifique se os dados enviados estao corretos.",
      });
    }

    throw error;
  }

  async function findUserByEmail(providedEmail) {
    let storedUser;

    try {
      storedUser = await user.findOneByEmail(providedEmail);
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw new UnathorizedError({
          message: "Email nao confere.",
          action: "Verifique se os dados enviados estao corretos.",
        });
      }

      throw error;
    }

    return storedUser;
  }

  async function validatePassword(providedPassword, storedPassword) {
    const correctPassword = await password.compare(
      providedPassword,
      storedPassword,
    );

    if (!correctPassword) {
      throw new UnathorizedError({
        message: "Senha nao confere.",
        action: "Verifique se os dados enviados estao corretos.",
      });
    }
  }
}

const authentication = {
  getAuthenticatedUser,
};
export default authentication;
