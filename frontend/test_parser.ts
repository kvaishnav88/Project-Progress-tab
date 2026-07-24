import { parseGeneratedComponent } from "./runtime/babel/parser";

const goodCode = `
import React from "react";
export default function LoginForm() {
  return <div>Hello</div>;
}
`;

const badCode = `
const App = (
`;

console.log("GOOD CODE ->", parseGeneratedComponent(goodCode));
console.log("BAD CODE ->", parseGeneratedComponent(badCode));