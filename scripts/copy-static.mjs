import { cpSync, mkdirSync, renameSync, rmSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";

rmSync("dist/client", { recursive: true, force: true });
mkdirSync("dist/client", { recursive: true });
mkdirSync("dist/server", { recursive: true });

for (const entry of ["assets", "index.html"]) {
  renameSync(`dist/${entry}`, `dist/client/${entry}`);
}

cpSync("script.js", "dist/client/script.js");
cpSync("page.css", "dist/client/page.css");
cpSync("pages", "dist/client/pages", { recursive: true });

const staticFiles = [
  "assets/resume/resume.pdf",
  "assets/images/ai-agent-slices/ai-agent-section-01.webp",
  "assets/images/ai-agent-slices/ai-agent-section-01-role-updated.webp",
  "assets/images/ai-agent-slices/ai-agent-section-01-optimized.webp",
  "assets/images/ai-agent-slices/ai-agent-section-02-clean.webp",
  "assets/images/ai-agent-slices/ai-agent-section-03.webp",
  "assets/images/ai-agent-slices/ai-agent-summary.webp",
  "assets/images/ai-agent-slices/ai-agent-video-01-placeholder.webp",
  "assets/images/ai-agent-slices/ai-agent-video-02-placeholder.webp",
  "assets/images/ai-agent-states/content-output.webp",
  "assets/images/ai-agent-states/error-feedback.webp",
  "assets/images/ai-agent-states/understanding.webp",
  "assets/images/ai-agent-states/voice-receiving.webp",
  "assets/images/ai-agent-states/waiting.webp",
  "assets/images/health-module/health-suite-home.webp",
  "assets/images/health-module/health-inspection-report.webp",
  "assets/images/health-module/full-scene-monitoring.webp",
  "assets/images/health-module/activity-monitoring.webp",
  "assets/images/health-module/sleep-monitoring.webp",
  "assets/images/health-module/sedentary-alert.webp",
  "assets/images/health-module/fall-emergency.webp",
  "assets/images/health-module/breath-heart-emergency.webp",
  "assets/videos/active-perception-inspection.webm",
  "assets/videos/active-perception-inspection-mobile.webm",
  "assets/videos/opening-no-text.webm",
  "assets/videos/wake-interaction.webm",
];

for (const source of staticFiles) {
  const target = `dist/client/${source}`;
  mkdirSync(dirname(target), { recursive: true });
  cpSync(source, target);
}
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
  ".webp": "image/png",
  ".webp": "image/jpeg",
  ".webp": "image/jpeg",
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
