// Tao anh bang gpt-image-2 qua proxy openai-oauth. Chay duoc tren moi he dieu hanh (can Node 18+).
// Dung: node gen-image.mjs --prompt "..." --out "duong/dan/anh.png" [--size 1024x1024]
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname } from "node:path";
const a = Object.fromEntries(process.argv.slice(2).reduce((r, v, i, x) => (v.startsWith("--") ? [...r, [v.slice(2), x[i + 1]]] : r), []));
if (!a.prompt || !a.out) { console.error("Thieu --prompt hoac --out"); process.exit(1); }
const base = a.base || "http://127.0.0.1:10531/v1";
let res;
try {
  res = await fetch(`${base}/images/generations`, {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ model: a.model || "gpt-image-2", prompt: a.prompt, size: a.size || "1024x1024", n: 1 }),
    signal: AbortSignal.timeout(280000),
  });
} catch (e) { console.error("Khong goi duoc server (da chay openai-oauth chua?):", e.message); process.exit(1); }
if (!res.ok) { console.error("Loi API", res.status, await res.text()); process.exit(1); }
const d = (await res.json()).data[0];
mkdirSync(dirname(a.out), { recursive: true });
if (d.b64_json) writeFileSync(a.out, Buffer.from(d.b64_json, "base64"));
else if (d.url) writeFileSync(a.out, Buffer.from(await (await fetch(d.url)).arrayBuffer()));
else { console.error("Khong co du lieu anh"); process.exit(1); }
console.log("Saved:", a.out);
