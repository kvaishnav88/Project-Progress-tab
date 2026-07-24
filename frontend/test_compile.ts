import { compileGeneratedComponent } from "./runtime/renderer/compile";

const jsxCode = `
function LoginForm() {
  return <button onClick={() => console.log("clicked")}>Login</button>;
}
`;

console.log(compileGeneratedComponent(jsxCode));