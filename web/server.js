import http from "http";
import { status, queryFull } from 'minecraft-server-util';

const host = 'localhost';
const port = 8000;

const getPlayers = async () => {
  try {
    const {version, players} = await queryFull('domovoy.hopto.org', 25565, {
      enableSRV: true
    })
    return {version, players};
  } catch (err) {
    console.error(err)
  }
}

const requestListener = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
	res.setHeader('Access-Control-Request-Method', '*');
	res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET');
	res.setHeader('Access-Control-Allow-Headers', '*');
  res.setHeader("Content-Type", "application/json");
  res.writeHead(200);
  switch (req.url) {
    case "/api/get-info":
        const result = await getPlayers();
        res.end(JSON.stringify(result));
        break
    default:
      res.end('{"status": "ok"}');
  }
};

const server = http.createServer(requestListener);
server.listen(port, host, () => {
    console.log(`Server is running on http://${host}:${port}`);
});
