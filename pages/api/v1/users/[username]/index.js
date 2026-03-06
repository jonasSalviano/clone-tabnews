import { createRouter } from "next-connect";
import controller from "infra/controller";
import user from "models/user";

const router = createRouter();

router.get(getHandle);

export default router.handler(controller.errorHandlers);

async function getHandle(request, response) {
  const { username } = request.query;
  const foundUser = await user.findOneByUsername(username);
  return response.status(200).json(foundUser);
}
