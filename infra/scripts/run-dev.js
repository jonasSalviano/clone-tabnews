const { spawn, execSync } = require("child_process");

const nextProcess = spawn("npx", ["next", "dev"], {
  stdio: "inherit",
  shell: true,
});

const cleanup = () => {
  console.log("\n Encerrando processos e limpanado containers");
  try {
    execSync("npm run services:down", { stdio: "inherit" });
  } catch (error) {
    console.error("Erro ao desligar os containers:", error.message);
  }
};

nextProcess.on("close", (code) => {
  cleanup();
  process.exit(code);
});

process.on("SIGINT", () => {
  cleanup();
  process.exit(0);
});
process.on("SIGTERM", () => {
  cleanup();
  process.exit(0);
});
