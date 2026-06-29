"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Eye, EyeOff, Chrome, CheckCircle, ArrowRight, Sun, Moon } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import { useTheme } from "@/components/ThemeProvider";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function LoginPage() {
  const router = useRouter();
  const { user, signInWithGoogle, signInAsGuest, saveUserProfile, signOut } = useAuth();
  const [error, setError] = useState("");
  const [googleConnecting, setGoogleConnecting] = useState(false);
  const [googleConnected, setGoogleConnected] = useState(Boolean(user));
  const [storedPassword, setStoredPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

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
    } else {
      setGoogleConnected(false);
      setName("");
      setUsername("");
      setPassword("");
      setStoredPassword("");
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

  const handleSwitchAccount = async () => {
    try {
      await signOut();
      setGoogleConnected(false);
      setName("");
      setUsername("");
      setPassword("");
      setStoredPassword("");
      setError("");
    } catch (err) {
      console.warn("Failed to switch Google account:", err);
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

  const { theme, setTheme } = useTheme();

  return (
    <main className="onboarding-page">
      {/* Left Column: Visual Image */}
      <div className="onboarding-visual-col">
        <div style={{ width: "100%", maxWidth: "480px", display: "flex", flexDirection: "column", alignItems: "center" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img 
            src={theme === "light" ? "/loginlight.png" : "/logindark.png"} 
            alt="ForeSee Login illustration" 
            style={{ 
              maxWidth: "100%", 
              maxHeight: "360px",
              height: "auto", 
              borderRadius: "12px", 
              objectFit: "contain",
              transition: "opacity 0.25s ease",
            }} 
          />
          <div style={{ marginTop: "24px", textAlign: "center" }}>
            <h3 style={{ fontSize: "16px", marginBottom: "8px" }}>Orchestrating Calm</h3>
            <p className="muted" style={{ fontSize: "13px", lineHeight: "1.4" }}>
              Log in to access your customized capacity profiles, Google Calendar focus blocks, and active timeline rescue recommendations.
            </p>
          </div>
        </div>
      </div>

      {/* Right Column: Form Container */}
      <div className="onboarding-form-col">
        <div style={{ maxWidth: "440px", width: "100%", margin: "0 auto" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px" }}>
            <span className="eyebrow" style={{ margin: 0 }}>Login</span>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <button 
                type="button"
                className="theme-switch-btn" 
                onClick={() => setTheme(theme === "light" ? "dark" : "light")}
                aria-label="Change theme"
                title={`Toggle theme (currently ${theme})`}
                style={{ width: "30px", height: "30px", borderRadius: "6px" }}
              >
                {theme === "light" ? <Moon size={14} /> : <Sun size={14} />}
              </button>
            </div>
          </div>
          
          <div style={{ margin: "8px 0 24px" }}>
            <h1 style={{ fontSize: "28px", margin: "0 0 8px" }}>Sign in to your deadline cockpit.</h1>
            <p className="lead" style={{ fontSize: "14px", lineHeight: "1.5" }}>
              Connect your Google account and enter your password to authenticate.
            </p>
          </div>

          <form onSubmit={handleLoginSubmit} className="stack" style={{ gap: "20px" }}>
            <div>
              {!googleConnected ? (
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  <button
                    type="button"
                    onClick={handleGoogleConnect}
                    disabled={googleConnecting}
                    style={{
                      width: "100%",
                      height: "44px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "12px",
                      background: "#ffffff",
                      color: "#1f1f1f",
                      border: "1px solid #dadce0",
                      borderRadius: "8px",
                      boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
                      fontWeight: 500,
                      fontSize: "14px",
                      cursor: "pointer",
                      transition: "all 0.2s ease"
                    }}
                  >
                    <svg viewBox="0 0 24 24" width="18" height="18" xmlns="http://www.w3.org/2000/svg">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
                    </svg>
                    <span>{googleConnecting ? "Connecting..." : "Log in with Google"}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      signInAsGuest();
                      router.push("/dashboard");
                    }}
                    style={{
                      width: "100%",
                      height: "44px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "12px",
                      background: "var(--surface-soft)",
                      color: "var(--text)",
                      border: "1px solid var(--surface-line)",
                      borderRadius: "8px",
                      fontWeight: 500,
                      fontSize: "14px",
                      cursor: "pointer",
                      transition: "all 0.2s ease"
                    }}
                  >
                    Continue as Guest / Developer Bypass
                  </button>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "8px", background: "var(--surface-soft)", padding: "12px 14px", borderRadius: "8px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "var(--success)", fontSize: "13px", fontWeight: 500 }}>
                    <CheckCircle size={16} />
                    <span>Google Account connected!</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleSwitchAccount}
                    style={{
                      background: "none",
                      border: "none",
                      color: "var(--accent)",
                      textDecoration: "underline",
                      cursor: "pointer",
                      fontSize: "12px",
                      textAlign: "left",
                      padding: 0,
                      width: "fit-content"
                    }}
                  >
                    Switch to a different account
                  </button>
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
                <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                  <input
                    required
                    type={showPassword ? "text" : "password"}
                    className="input"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    style={{ paddingRight: "40px", width: "100%" }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    onDoubleClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      setShowPassword(false);
                    }}
                    style={{
                      position: "absolute",
                      right: "12px",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      color: "var(--muted)",
                      padding: 0,
                      display: "flex",
                      alignItems: "center"
                    }}
                    title="Click to toggle, double click to lock hidden"
                  >
                    {showPassword ? <Eye size={16} /> : <EyeOff size={16} />}
                  </button>
                </div>
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

          <div style={{ display: "flex", flexDirection: "column", gap: "16px", alignItems: "center", marginTop: "24px" }}>
            <Link href="/" className="button-red-landing" style={{ width: "100%" }}>
              Go back to landing page
            </Link>
            <div style={{ fontSize: "13px", textAlign: "center" }}>
              <span className="muted">New to the website? </span>
              <Link href="/onboarding" style={{ textDecoration: "underline", color: "var(--accent)", fontWeight: 500 }}>
                Sign up
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
