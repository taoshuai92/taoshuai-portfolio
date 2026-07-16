import { cpSync, mkdirSync, renameSync, rmSync, writeFileSync } from "node:fs";

rmSync("dist/client", { recursive: true, force: true });
mkdirSync("dist/client", { recursive: true });
mkdirSync("dist/server", { recursive: true });

for (const entry of ["assets", "index.html"]) {
  renameSync(`dist/${entry}`, `dist/client/${entry}`);
}

cpSync("script.js", "dist/client/script.js");
cpSync("page.css", "dist/client/page.css");
cpSync("pages", "dist/client/pages", { recursive: true });
cpSync("assets/images", "dist/client/assets/images", { recursive: true });
cpSync("assets/videos", "dist/client/assets/videos", { recursive: true });
cpSync("assets/resume", "dist/client/assets/resume", { recursive: true });
writeFileSync("dist/client/.nojekyll", "");
writeFileSync("dist/client/CNAME", "taoshuai.cn\n");

mkdirSync("dist/.openai", { recursive: true });
cpSync(".openai/hosting.json", "dist/.openai/hosting.json");

writeFileSync(
  "dist/server/index.js",
  `import { readFile } from "node:fs/promises";
import { extname, join, normalize } from "node:path";

const root = join(process.cwd(), "dist", "client");
const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".webm": "video/webm",
  ".pdf": "application/pdf",
};

function safePath(pathname) {
  const decoded = decodeURIComponent(pathname.split("?")[0]);
  const normalized = normalize(decoded).replace(/^([/\\\\])+/, "");
  return normalized.includes("..") ? "index.html" : normalized || "index.html";
}

async function serve(request) {
  const url = new URL(request.url);
  let pathname = safePath(url.pathname);

  if (pathname.endsWith("/")) {
    pathname += "index.html";
  }

  let filePath = join(root, pathname);

  try {
    const body = await readFile(filePath);
    const headers = new Headers({
      "content-type": mimeTypes[extname(filePath)] || "application/octet-stream",
      "cache-control": "public, max-age=3600",
    });

    if (extname(filePath) === ".pdf") {
      headers.set("content-disposition", 'attachment; filename="resume.pdf"');
    }

    return new Response(body, { headers });
  } catch (error) {
    const body = await readFile(join(root, "index.html"));
    return new Response(body, {
      headers: { "content-type": "text/html; charset=utf-8" },
    });
  }
}

export default { fetch: serve };
export { serve as fetch };
`
);
