import retry from "async-retry";

async function waitForAllServices() {
  await waitForWebServer();
  async function waitForWebServer() {
    return retry(fetchStatusPage, {
      retries: 100,
    });

    async function fetchStatusPage() {
      const res = await fetch("http://localhost:3000/api/v1/status");
      const data = await res.json();
      if (!data.update_at) {
        throw new Error("Web server is not ready");
      }
    }
  }
}

export default { waitForAllServices };
