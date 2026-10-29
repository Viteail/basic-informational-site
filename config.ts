import process from "node:process";

export const config = {
  PORT: parseInt(process.env.PORT || "8080", 10),
};
