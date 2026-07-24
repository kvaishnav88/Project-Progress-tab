import { sanitizeGeneratedMarkup } from "./runtime/security/sanitize";

const safeHtml = "<div><p>Hello world</p></div>";
const dangerousHtml = '<div><script>alert("hacked")</script><p onclick="alert(1)">Click</p></div>';

console.log("SAFE HTML ->", sanitizeGeneratedMarkup(safeHtml));
console.log("DANGEROUS HTML ->", sanitizeGeneratedMarkup(dangerousHtml));