import database from "../../../../infra/database.js";
async function status(request, response) {
  const consult = await database.query("Select 1 + 1 as sum;");
  console.log(consult.rows);
  response.status(200).json({ status: "ok" });
}

export default status;
