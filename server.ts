import express from "express";
import fs from "node:fs/promises";
import { config } from "./config.js";

const app = express();

type Route = {
  file: string;
  contentType: string;
};

const AVAILABLE_URLS = [
  "/",
  "/index",
  "/about",
  "/contact-me",
  "/public/style.css",
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
  "/public/style.css": {
    file: "./public/style.css",
    contentType: "text/css; charset=utf-8",
  },
};

type RouteResponse = {
  status: number;
  file?: string;
  message?: string;
  contentType?: string;
};

const getFileByPath = async (path: string): Promise<RouteResponse> => {
  const pathname = new URL(path ?? "/", "http://localhost").pathname;
  const route = routes[pathname as keyof typeof routes];
  const statusCode = route ? 200 : 404;
  const contentType = route?.contentType ?? "text/html; charset=utf-8";
  const filePath = route?.file ?? "./404.html";

  try {
    const file = await fs.readFile(filePath, "utf8");
    return { status: statusCode, file, contentType };
  } catch (error) {
    console.error(`Failed to read file ${filePath}`, error);

    return route
      ? {
          status: 500,
          message: "500 - Internal Server Error",
        }
      : {
          status: 404,
          message: "404 - Page Not Found",
        };
  }
};

app.use(express.static("public"));

app.get("/{*path}", async (req, res) => {
  const httpResponse = await getFileByPath(req.url);

  if (httpResponse.file !== undefined)
    return res
      .type(httpResponse.contentType!)
      .status(httpResponse.status)
      .send(httpResponse.file);

  return res.status(httpResponse.status).send(httpResponse.message);
});

app.listen(config.PORT, () => {
  console.log(`Express server is running on port ${config.PORT}`);
});
