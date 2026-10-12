import { cn } from "cn"

import { Button } from "@/components/ui/button"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  createUserWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { Link, Navigate, useNavigate } from "react-router-dom";

import { auth, db } from "../firebase";
import { useAuth } from "../auth/AuthContext";
import { useState, type FormEvent } from "react";
import SocialAuthButtons from "./social-auth";


export function SignupForm({
  className,
  ...props
}: React.ComponentProps<"form">) {

   const { user, role, loading } = useAuth();
  const navigate = useNavigate();

  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (loading) return <p>Loading...</p>;

  if (user && role) {
    return <Navigate to={`/${role}`} replace />;
  }

  if (user && !role) {
    return <Navigate to="/access-denied" replace />;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setSubmitting(true);
    let accountCreated = false;

    try {
      const credential = await createUserWithEmailAndPassword(
        auth,
        email.trim(),
        password
      );

      accountCreated = true;

      await updateProfile(credential.user, {
        displayName: displayName.trim(),
      });

      await setDoc(doc(db, "users", credential.user.uid), {
        displayName: displayName.trim(),
        email: credential.user.email,
        role: "member",
        createdAt: serverTimestamp(),
      });

      navigate("/member", { replace: true });
    } catch (err) {
      console.error("Signup failed:", err);

      if (accountCreated) {
        setError(
          "Your account was created, but your profile could not be saved. Please contact support."
        );
      } else {
        const code = (err as { code?: string }).code;

        if (code === "auth/email-already-in-use") {
          setError("This email is already registered. Please log in.");
        } else if (code === "auth/invalid-email") {
          setError("Please enter a valid email address.");
        } else if (code === "auth/weak-password") {
          setError("Please choose a stronger password.");
        } else {
          setError("Unable to create your account. Please try again.");
        }
      }
    } finally {
      setSubmitting(false);
    }
  }


  return (
    <form onSubmit={handleSubmit} className={cn("flex flex-col gap-6", className)} {...props}>
      <FieldGroup>
        <div className="flex flex-col items-center gap-1 text-center">
          <h1 className="text-2xl font-bold">Create your account</h1>
          <p className="text-sm text-balance text-muted-foreground">
            Fill in the form below to create your account
          </p>
        </div>
        <Field>
          <FieldLabel htmlFor="fname">Full Name</FieldLabel>
          <Input
            id="fname"
            type="text"
            placeholder="John Doe"
            required
            className="bg-background"
            autoComplete="name"
            value={displayName}
            onChange={(event) => setDisplayName(event.target.value)}
            maxLength={100}
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <Input
            id="email"
            type="email"
            placeholder="m@example.com"
            required
            className="bg-background"
            autoComplete="username"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
          <FieldDescription>
            We&apos;ll use this to contact you. We will not share your email
            with anyone else.
          </FieldDescription>
        </Field>
        <Field>
          <FieldLabel htmlFor="password">Password</FieldLabel>
          <Input
            id="password"
            type="password"
            required
            className="bg-background"
            autoComplete="new-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            minLength={8}
          />
          <FieldDescription>
            Must be at least 8 characters long.
          </FieldDescription>
        </Field>
        <Field>
          <FieldLabel htmlFor="confirm-password">Confirm Password</FieldLabel>
          <Input
            id="confirm-password"
            type="password"
            required
            className="bg-background"
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            minLength={8}
          />
          <FieldDescription>Please confirm your password.</FieldDescription>
        </Field>
        <Field>
          <Button type="submit" disabled={submitting} > {submitting ? "Creating account..." : "Create Account"}</Button>
        </Field>
        {error && <p className="auth-error" role="alert">{error}</p>}
        <FieldSeparator>Or continue with</FieldSeparator>
        <Field>
          <SocialAuthButtons />
          <FieldDescription className="px-6 text-center">
            Already have an account? <Link to="/login">Sign in</Link>
          </FieldDescription>
        </Field>
      </FieldGroup>
    </form>
  )
}
