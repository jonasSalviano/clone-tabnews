import useSWR from "swr";

async function fetchAPI(key) {
  const res = await fetch(key);
  const data = await res.json();
  return data;
}

export default function StatusPage() {
  return (
    <>
      <h1>Status Page</h1>
      <UpdateAt />
      <Database />
    </>
  );
}

function UpdateAt() {
  const { isLoading, data } = useSWR("/api/v1/status", fetchAPI);

  let updatedAtText = "Carregando...";

  if (!isLoading && data) {
    updatedAtText = new Date(data.update_at).toLocaleString("pt-BR");
  }

  return <div> Ultima atualizacao: {updatedAtText} </div>;
}

function Database() {
  const { isLoading, data } = useSWR("/api/v1/status");

  let connectionsActiveText = "Carregando...";
  let versionDBText = "Carregando...";
  let maxConnectionsText = "Carregando...";

  if (!isLoading && data) {
    connectionsActiveText = data.dependencies.database.connections_active;
    versionDBText = data.dependencies.database.version_db;
    maxConnectionsText = data.dependencies.database.max_connections;
  }

  return (
    <>
      <h1>Database</h1>
      <div> Conexoes ativas: {connectionsActiveText} </div>
      <div> Maximo de conexoes: {maxConnectionsText} </div>
      <div> Versao: {versionDBText} </div>
    </>
  );
}
