import { cpSync, mkdirSync } from "node:fs";

mkdirSync("dist/assets", { recursive: true });
mkdirSync("dist/.openai", { recursive: true });

cpSync("script.js", "dist/script.js");
cpSync("page.css", "dist/page.css");
cpSync("pages", "dist/pages", { recursive: true });
cpSync("assets/resume", "dist/assets/resume", { recursive: true });
cpSync(".openai/hosting.json", "dist/.openai/hosting.json");
