"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Eye, Chrome, CheckCircle, ArrowRight } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function LoginPage() {
  const router = useRouter();
  const { user, signInWithGoogle, saveUserProfile } = useAuth();
  const [error, setError] = useState("");
  const [googleConnecting, setGoogleConnecting] = useState(false);
  const [googleConnected, setGoogleConnected] = useState(Boolean(user));
  const [storedPassword, setStoredPassword] = useState("");

  // Form State
  const [name, setName] = useState(user?.displayName ?? "");
  const [username, setUsername] = useState(user?.email?.split("@")[0] ?? "");
  const [password, setPassword] = useState("");

  useEffect(() => {
    if (user) {
      setGoogleConnected(true);
      setName(user.displayName ?? "");
      setUsername(user.email?.split("@")[0] ?? "");

      const fetchProfile = async () => {
        try {
          const docRef = doc(db, "users", user.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const data = docSnap.data();
            if (data.name) setName(data.name);
            if (data.username) setUsername(data.username);
            if (data.password) setStoredPassword(data.password);
          }
        } catch (err) {
          console.warn("Failed to fetch user credentials:", err);
        }
      };
      fetchProfile();
    }
  }, [user]);

  const handleGoogleConnect = async () => {
    setError("");
    setGoogleConnecting(true);
    try {
      const signedInUser = await signInWithGoogle();
      setGoogleConnected(true);
      setName(signedInUser.displayName ?? "");
      setUsername(signedInUser.email?.split("@")[0] ?? "");

      const docRef = doc(db, "users", signedInUser.uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.name) setName(data.name);
        if (data.username) setUsername(data.username);
        if (data.password) setStoredPassword(data.password);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Google sign-in failed.";
      setError(message);
    } finally {
      setGoogleConnecting(false);
    }
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!googleConnected) {
      setError("Please connect your Google account first.");
      return;
    }

    if (storedPassword) {
      if (password !== storedPassword) {
        setError("Incorrect password. Please try again.");
        setPassword(""); // Clear field for security
        return;
      }
      
      // Save name/username updates if needed
      saveUserProfile({
        name,
        username
      }).catch((err) => {
        console.warn("Profile sync during login failed:", err);
      });
    } else {
      // Register this password in the database for future logins
      if (!password) {
        setError("Please enter a password to secure your account.");
        return;
      }
      
      saveUserProfile({
        name,
        username,
        password
      }).catch((err) => {
        console.warn("Profile sync during login failed:", err);
      });
    }

    router.push("/dashboard");
  };

  return (
    <main className="auth-page">
      <section className="card auth-card stack" style={{ padding: "40px", gap: "20px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span className="brand-mark">
            <Eye size={20} />
          </span>
          <span className="pill" style={{ fontSize: "11px" }}>
            Firebase Auth
          </span>
        </div>
        
        <div style={{ margin: "8px 0 0" }}>
          <p className="eyebrow" style={{ marginBottom: "6px" }}>
            Welcome to ForeSee
          </p>
          <h1 style={{ fontSize: "26px", margin: "0 0 12px" }}>Sign in to your deadline cockpit.</h1>
          <p className="lead" style={{ fontSize: "14px", lineHeight: "1.5" }}>
            Connect your Google account and enter your password to authenticate.
          </p>
        </div>

        <form onSubmit={handleLoginSubmit} className="stack" style={{ gap: "20px" }}>
          <div>
            {!googleConnected ? (
              <button
                type="button"
                className="button button-secondary"
                disabled={googleConnecting}
                onClick={handleGoogleConnect}
                style={{ width: "100%", height: "44px", display: "flex", alignItems: "center", justifyContent: "center", gap: "10px" }}
              >
                <Chrome size={18} />
                <span>{googleConnecting ? "Connecting..." : "Connect Google Account"}</span>
              </button>
            ) : (
              <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "var(--success)", fontSize: "13px", fontWeight: 500, background: "var(--surface-soft)", padding: "10px 14px", borderRadius: "8px" }}>
                <CheckCircle size={16} />
                <span>Google Account connected!</span>
              </div>
            )}
            {error && (
              <p className="muted" style={{ color: "var(--danger)", fontSize: "12px", marginTop: "8px" }}>
                {error}
              </p>
            )}
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "12px", width: "100%", margin: "4px 0" }}>
            <div style={{ flex: 1, height: "1px", background: "var(--surface-line)" }}></div>
            <span className="muted" style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.05em" }}>Credentials</span>
            <div style={{ flex: 1, height: "1px", background: "var(--surface-line)" }}></div>
          </div>

          <div className="stack" style={{ gap: "16px" }}>
            <label className="label">
              <span>Full name</span>
              <input
                required
                className="input"
                placeholder="e.g. Krish Sahoo"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </label>

            <label className="label">
              <span>Username</span>
              <input
                required
                className="input"
                placeholder="e.g. krishsahoo"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </label>

            <label className="label">
              <span>Password</span>
              <input
                required
                type="password"
                className="input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </label>
          </div>

          <button
            type="submit"
            className="button button-primary"
            style={{ width: "100%", height: "44px", marginTop: "8px" }}
          >
            Log in <ArrowRight size={16} />
          </button>
        </form>

        <div style={{ textAlign: "center", marginTop: "8px", display: "flex", justifyContent: "space-between", fontSize: "12.5px" }}>
          <div>
            <span className="muted">New to the website? </span>
            <Link href="/onboarding" style={{ textDecoration: "underline", color: "var(--accent)", fontWeight: 500 }}>
              Sign up
            </Link>
          </div>
          <Link href="/" className="muted" style={{ textDecoration: "underline" }}>
            Go back to landing page
          </Link>
        </div>
      </section>
    </main>
  );
}
