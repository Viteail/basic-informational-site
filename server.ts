import http from "node:http";
import fs from "node:fs/promises";

type Route = {
  file: string;
  contentType: string;
};

const AVAILABLE_URLS = [
  "/",
  "/index",
  "/about",
  "/contact-me",
  "/style.css",
] as const;

type AvailableURL = (typeof AVAILABLE_URLS)[number];

const routes: Record<AvailableURL, Route> = {
  "/": {
    file: "./index.html",
    contentType: "text/html; charset=utf-8",
  },
  "/index": {
    file: "./index.html",
    contentType: "text/html; charset=utf-8",
  },
  "/about": {
    file: "./about.html",
    contentType: "text/html; charset=utf-8",
  },
  "/contact-me": {
    file: "./contact-me.html",
    contentType: "text/html; charset=utf-8",
  },
  "/style.css": {
    file: "./style.css",
    contentType: "text/css; charset=utf-8",
  },
};

const server = http.createServer(async (req, res) => {
  if (req.method !== "GET" && req.method !== "HEAD") {
    res.writeHead(405, {
      "content-type": "text/plain; charset=utf8",
      allow: "GET, HEAD",
    });
    res.end("Method not allowed");
    return;
  }

  const pathname = new URL(req.url ?? "/", "http://localhost").pathname;
  const route = routes[pathname];
  const statusCode = route ? 200 : 404;
  const filePath = route?.file ?? "./404.html";
  const contentType = route?.contentType ?? "text/html; charset=utf-8";

  try {
    const file = await fs.readFile(filePath, "utf8");

    res.writeHead(statusCode, {
      "content-type": contentType,
    });

    res.end(req.method === "HEAD" ? undefined : file);
  } catch (error) {
    console.error(`Failed to read file ${filePath}`, error);

    const status = route ? 500 : 404;
    const message =
      status === 500 ? "500 - Internal Server Error" : "404 - Page Not Found";

    res.writeHead(status, {
      "content-type": "text/plain; charset=utf-8",
    });

    res.end(req.method === "HEAD" ? undefined : message);
  }
});

server.listen(8080, () => {
  console.log("Server is running on port 8080");
});
