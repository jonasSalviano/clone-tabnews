import { createRouter } from "next-connect";
import controller from "infra/controller";
import user from "models/user";

const router = createRouter();

router.get(getHandle);
router.patch(patchHandle);

export default router.handler(controller.errorHandlers);

async function getHandle(request, response) {
  const { username } = request.query;
  const foundUser = await user.findOneByUsername(username);
  return response.status(200).json(foundUser);
}

async function patchHandle(request, response) {
  const username = request.query.username;
  const userInputValues = request.body;

  const updatedUser = await user.update(username, userInputValues);
  return response.status(200).json(updatedUser);
}
