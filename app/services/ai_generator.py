"""
Adapter for calling an external AI UI generation API.

This module keeps the backend from duplicating AI cognitive-load
calculation and code generation, instead proxying requests to an existing
external AI service and validating the returned runtime payload.
"""

from __future__ import annotations

import hashlib
import json
import re
from typing import Any

import httpx

from app.core.config import settings


def prompt_hash(prompt: str, user_id: int | None = None) -> str:
    normalized = " ".join(prompt.strip().lower().split())
    seed = f"{user_id or 0}:{normalized}"
    return hashlib.sha256(seed.encode("utf-8")).hexdigest()


def payload_hash(payload: dict[str, Any], user_id: int | None = None) -> str:
    normalized = json.dumps(payload, sort_keys=True)
    seed = f"{user_id or 0}:{normalized}"
    return hashlib.sha256(seed.encode("utf-8")).hexdigest()


def normalize_component_name(component_name: str | None, prompt: str | None = None) -> str:
    if isinstance(component_name, str) and component_name.strip():
        return component_name.strip()
    if isinstance(prompt, str) and prompt.strip():
        words = [w.capitalize() for w in re.findall(r"[a-zA-Z0-9]+", prompt)][:6]
        name = "".join(words)
        if name and not name[0].isalpha():
            name = f"Ui{name}"
        return name or "GeneratedComponent"
    return "GeneratedComponent"


async def call_external_ai(payload: dict[str, Any]) -> dict[str, Any]:
    async with httpx.AsyncClient(timeout=30.0) as client:
        response = await client.post(settings.AI_SERVICE_URL, json=payload)
        response.raise_for_status()
        data = response.json()

    if not isinstance(data, dict):
        raise ValueError("AI service returned unexpected response format")
    if "component" not in data:
        raise ValueError("AI service response missing required field: component")

    return {
        "strategy": str(data.get("strategy", "")),
        "component": str(data["component"]),
        "is_valid": bool(data.get("is_valid", False)),
        "generation_time": float(data.get("generation_time", 0.0)),
        "component_name": str(data.get("component_name", "")),
    }


def cache_key_for_prompt(prompt: str, user_id: int | None = None) -> str:
    return prompt_hash(prompt, user_id)


def _slug_to_component_name(prompt: str) -> str:
    words = re.findall(r"[a-zA-Z0-9]+", prompt)
    if not words:
        return "GeneratedComponent"
    name = "".join(w.capitalize() for w in words[:6])
    if not name[0].isalpha():
        name = f"Ui{name}"
    return name[:80]


def _match(prompt: str, *keywords: str) -> bool:
    return any(k in prompt for k in keywords)


def generate_react_component(prompt: str) -> dict[str, Any]:
    """
    Generate a React functional component from a natural-language prompt.
    Returns component_name, generated_code, and a short summary.
    """
    lower = prompt.lower()
    component_name = _slug_to_component_name(prompt)

    if _match(lower, "login", "sign in", "signin"):
        component_name = "LoginPage"
        code = """export default function LoginPage() {
  return (
    <div className="login-page" style={{ maxWidth: 360, margin: "2rem auto", fontFamily: "system-ui" }}>
      <h1>Sign In</h1>
      <form onSubmit={(e) => e.preventDefault()}>
        <label style={{ display: "block", marginBottom: 12 }}>
          Email
          <input type="email" name="email" required style={{ display: "block", width: "100%", marginTop: 4 }} />
        </label>
        <label style={{ display: "block", marginBottom: 12 }}>
          Password
          <input type="password" name="password" required style={{ display: "block", width: "100%", marginTop: 4 }} />
        </label>
        <button type="submit">Login</button>
      </form>
    </div>
  );
}
"""
    elif _match(lower, "dashboard", "analytics", "overview"):
        component_name = "DashboardPage"
        code = """export default function DashboardPage() {
  return (
    <div className="dashboard-page" style={{ padding: 24, fontFamily: "system-ui" }}>
      <h1>Dashboard</h1>
      <p>Welcome back. Here is your overview.</p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
        <section style={{ border: "1px solid #ddd", padding: 16 }}>
          <h2>Users</h2>
          <strong>1,248</strong>
        </section>
        <section style={{ border: "1px solid #ddd", padding: 16 }}>
          <h2>Sessions</h2>
          <strong>392</strong>
        </section>
        <section style={{ border: "1px solid #ddd", padding: 16 }}>
          <h2>Cognitive Load</h2>
          <strong>0.62</strong>
        </section>
      </div>
    </div>
  );
}
"""
    elif _match(lower, "profile", "account", "settings"):
        component_name = "ProfilePage"
        code = """export default function ProfilePage() {
  return (
    <div className="profile-page" style={{ maxWidth: 480, margin: "2rem auto", fontFamily: "system-ui" }}>
      <h1>Profile</h1>
      <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
        <div style={{ width: 64, height: 64, borderRadius: "50%", background: "#ccc" }} />
        <div>
          <h2>User Name</h2>
          <p>user@auragen.dev</p>
        </div>
      </div>
      <button type="button" style={{ marginTop: 16 }}>Edit Profile</button>
    </div>
  );
}
"""
    elif _match(lower, "signup", "sign up", "register"):
        component_name = "SignupPage"
        code = """export default function SignupPage() {
  return (
    <div className="signup-page" style={{ maxWidth: 360, margin: "2rem auto", fontFamily: "system-ui" }}>
      <h1>Create Account</h1>
      <form onSubmit={(e) => e.preventDefault()}>
        <label style={{ display: "block", marginBottom: 12 }}>
          Name
          <input type="text" name="name" required style={{ display: "block", width: "100%", marginTop: 4 }} />
        </label>
        <label style={{ display: "block", marginBottom: 12 }}>
          Email
          <input type="email" name="email" required style={{ display: "block", width: "100%", marginTop: 4 }} />
        </label>
        <label style={{ display: "block", marginBottom: 12 }}>
          Password
          <input type="password" name="password" required style={{ display: "block", width: "100%", marginTop: 4 }} />
        </label>
        <button type="submit">Sign Up</button>
      </form>
    </div>
  );
}
"""
    elif _match(lower, "button", "cta"):
        component_name = "PrimaryButton"
        code = """export default function PrimaryButton({ label = "Get Started", onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        background: "#111",
        color: "#fff",
        border: "none",
        padding: "12px 20px",
        borderRadius: 8,
        cursor: "pointer",
      }}
    >
      {label}
    </button>
  );
}
"""
    else:
        title = prompt.strip()[:60] or "Generated UI"
        code = (
            f"export default function {component_name}() {{\n"
            f"  return (\n"
            f'    <div className="{component_name.lower()}" '
            f'style={{{{ padding: 24, fontFamily: "system-ui" }}}}>\n'
            f"      <h1>{title}</h1>\n"
            f"      <p>AI-generated React component for: {title}</p>\n"
            f"    </div>\n"
            f"  );\n"
            f"}}\n"
        )

    return {
        "component_name": component_name,
        "generated_code": code.strip() + "\n",
        "prompt": prompt.strip(),
        "summary": f"Generated {component_name} from prompt",
    }


def serialize_cached_payload(payload: dict[str, Any]) -> str:
    return json.dumps(payload)


def deserialize_cached_payload(raw: str) -> dict[str, Any] | None:
    try:
        data = json.loads(raw)
        if isinstance(data, dict) and "component" in data:
            return data
    except json.JSONDecodeError:
        return None
    return None
