
import { useState } from "react";
import {
  GoogleAuthProvider,
  OAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import {
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";
import { useNavigate } from "react-router-dom";

import { auth, db } from "../firebase";
import { Button } from "./ui/button";

export default function SocialAuthButtons() {
  const navigate = useNavigate();
  const [loadingProvider, setLoadingProvider] = useState<
    "google" | "apple" | null
  >(null);
  const [error, setError] = useState("");

  async function signInWithProvider(providerName: "google" | "apple") {
    setError("");
    setLoadingProvider(providerName);

    try {
      const provider =
        providerName === "google"
          ? new GoogleAuthProvider()
          : new OAuthProvider("apple.com");

      if (providerName === "apple") {
        provider.addScope("email");
        provider.addScope("name");
      }

      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      const userRef = doc(db, "users", user.uid);
      const userSnapshot = await getDoc(userRef);

      if (!userSnapshot.exists()) {
        await setDoc(userRef, {
          displayName: user.displayName ?? "",
          email: user.email ?? "",
          role: "member",
          createdAt: serverTimestamp(),
        });
      }

      const profile = await getDoc(userRef);
      const profileData = profile.data();
      const role = profileData?.role;

      if (
        role !== "admin" &&
        role !== "staff" &&
        role !== "member"
      ) {
        await auth.signOut();
        setError("Your account has no valid role. Contact support.");
        return;
      }

      const hasNonEmptyValue = (value: unknown) =>
        typeof value === "string"
          ? value.trim().length > 0
          : typeof value === "number"
            ? Number.isFinite(value)
            : false;
      const hasJobDetails = [
        profileData?.professionalTitle,
        profileData?.workType,
        profileData?.experienceYears,
        profileData?.skills,
        profileData?.location,
      ].every(hasNonEmptyValue);
      navigate(hasJobDetails ? `/${role}` : `/${role}/account`, { replace: true });
    } catch (err) {
      console.error("Social sign-in failed:", err);

      const code = (err as { code?: string }).code;

      if (code === "auth/popup-closed-by-user") {
        setError("Sign-in was cancelled.");
      } else if (code === "auth/popup-blocked") {
        setError("Your browser blocked the sign-in popup.");
      } else if (code === "auth/account-exists-with-different-credential") {
        setError(
          "An account with this email already exists using another sign-in method. Sign in with that method first."
        );
      } else {
        setError(
          "Unable to sign in. Check your provider configuration and try again."
        );
      }
    } finally {
      setLoadingProvider(null);
    }
  }

  return (
    <div>
      {error && (
        <p className="text-red-400 my-4" role="alert">
          {error}
        </p>
      )}

      <div className="flex flex-col gap-2 sm:flex-row" >
        <Button
        type="button"
        disabled={loadingProvider !== null}
        onClick={() => signInWithProvider("google")}
        className="h-auto min-h-10 w-full min-w-0 whitespace-normal px-3 py-2 text-center sm:flex-1"
      >
        <GoogleIcon />
        <span className="min-w-0 whitespace-normal">
          {loadingProvider === "google"
            ? "Connecting to Google..."
            : "Continue with Google"}
        </span>
      </Button>

      <Button
        type="button"
        disabled={loadingProvider !== null}
        onClick={() => signInWithProvider("apple")}
        className="h-auto min-h-10 w-full min-w-0 whitespace-normal px-3 py-2 text-center sm:flex-1"
      >
        <AppleIcon />
        <span className="min-w-0 whitespace-normal">
          {loadingProvider === "apple"
            ? "Connecting to Apple..."
            : "Continue with Apple"}
        </span>
      </Button>
      </div>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 48 48" width="20" height="20" aria-hidden="true">
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5Z" transform="translate(0 4)"/>
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.73 7.18l7.62 5.91c4.45-4.11 7.15-10.17 7.15-17.56Z"/>
      <path fill="#FBBC05" d="M10.53 28.59a14.4 14.4 0 0 1 0-9.18l-7.98-6.19a23.95 23.95 0 0 0 0 21.56l7.98-6.19Z" transform="translate(0 4)"/>
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.9-5.89l-7.62-5.91c-2.12 1.42-4.83 2.26-8.28 2.26-6.26 0-11.57-4.22-13.46-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48Z"/>
    </svg>
  );
}

function AppleIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true">
      <path d="M16.37 12.22c.03 3.2 2.8 4.26 2.83 4.28-.02.08-.44 1.53-1.46 3.03-.88 1.29-1.8 2.57-3.24 2.6-1.42.03-1.88-.84-3.51-.84-1.64 0-2.15.82-3.5.87-1.4.05-2.47-1.39-3.36-2.67-1.82-2.63-3.2-7.43-1.34-10.68.92-1.61 2.56-2.63 4.33-2.66 1.35-.03 2.63.91 3.51.91.87 0 2.51-1.13 4.23-.97.72.03 2.75.29 4.05 2.33-.1.06-2.42 1.41-2.4 3.8ZM13.6 4.36c.74-.9 1.24-2.15 1.1-3.36-1.07.04-2.36.72-3.12 1.62-.68.78-1.28 2.05-1.12 3.25 1.19.09 2.4-.61 3.14-1.51Z"/>
    </svg>
  );
}
