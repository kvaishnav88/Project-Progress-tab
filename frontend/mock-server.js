const http = require("http");

const mockResponse = {
  strategy: "high_cognitive_load",
  component: `
export default function LoginForm() {
  return <button onClick={() => alert("Login clicked from MOCK backend!")}>Login</button>;
}
`,
  is_valid: true,
  generation_time: 2.47,
};

const server = http.createServer((req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }

  if (req.method === "POST" && req.url === "/generate-ui") {
    let body = "";
    req.on("data", (chunk) => (body += chunk));
    req.on("end", () => {
      console.log("Mock server received:", body);
      res.setHeader("Content-Type", "application/json");
      res.writeHead(200);
      res.end(JSON.stringify(mockResponse));
    });
    return;
  }

  res.writeHead(404);
  res.end("Not found");
});

server.listen(8000, () => {
  console.log("Mock AI backend running on http://localhost:8000");
});