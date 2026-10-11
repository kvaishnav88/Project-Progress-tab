import { copyFileSync, existsSync, mkdirSync } from "node:fs";

const files = [
  ["node_modules/react/umd/react.production.min.js", "public/sandbox/react.production.min.js"],
  ["node_modules/react-dom/umd/react-dom.production.min.js", "public/sandbox/react-dom.production.min.js"],
];

mkdirSync("public/sandbox", { recursive: true });
for (const [from, to] of files) {
  if (!existsSync(from)) {
    console.error("Missing " + from);
    process.exit(1);
  }
  copyFileSync(from, to);
}
console.log("sandbox assets copied");