import { cn } from "cn";
import { useForm, type SubmitHandler } from "react-hook-form";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import { Link, Navigate, useNavigate } from "react-router-dom";

import { useAuth } from "@/auth/AuthContext";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { auth, db } from "../firebase";
import SocialAuthButtons from "./social-auth";

interface SignupValues {
  displayName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export function SignupForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  const { user, role, loading } = useAuth();
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    getValues,
    setError,
    clearErrors,
    formState: { errors, isSubmitting },
  } = useForm<SignupValues>({
    mode: "onBlur",
    defaultValues: { displayName: "", email: "", password: "", confirmPassword: "" },
  });

  if (loading) return <p>Loading...</p>;
  if (user && role) return <Navigate to={`/${role}`} replace />;
  if (user && !role) return <Navigate to="/access-denied" replace />;

  const onSubmit: SubmitHandler<SignupValues> = async ({ displayName, email, password }) => {
    clearErrors("root.server");
    let accountCreated = false;

    try {
      const credential = await createUserWithEmailAndPassword(auth, email.trim(), password);
      accountCreated = true;

      await updateProfile(credential.user, { displayName: displayName.trim() });
      await setDoc(doc(db, "users", credential.user.uid), {
        displayName: displayName.trim(),
        email: credential.user.email,
        role: "member",
        createdAt: serverTimestamp(),
      });

      navigate("/member/account", { replace: true });
    } catch (err) {
      console.error("Signup failed:", err);

      if (accountCreated) {
        setError("root.server", {
          type: "server",
          message: "Your account was created, but your profile could not be saved. Please contact support.",
        });
        return;
      }

      const code = (err as { code?: string }).code;
      const message =
        code === "auth/email-already-in-use"
          ? "This email is already registered. Please log in."
          : code === "auth/invalid-email"
            ? "Please enter a valid email address."
            : code === "auth/weak-password"
              ? "Please choose a stronger password."
              : "Unable to create your account. Please try again.";
      setError("root.server", { type: "server", message });
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      className={cn("flex flex-col gap-6", className)}
      {...props}
    >
      <FieldGroup>
        <div className="flex flex-col items-center gap-1 text-center">
          <h1 className="text-2xl font-bold">Create your account</h1>
          <p className="text-sm text-balance text-muted-foreground">
            Join the Web3 community and grow with the guild.
          </p>
        </div>
        <Field>
          <FieldLabel htmlFor="fname">Full Name</FieldLabel>
          <Input
            id="fname"
            type="text"
            placeholder="Jane Doe"
            className="bg-background"
            autoComplete="name"
            maxLength={100}
            aria-invalid={Boolean(errors.displayName)}
            {...register("displayName", {
              required: "Please enter your name.",
              validate: (value) => Boolean(value.trim()) || "Please enter your name.",
              maxLength: { value: 100, message: "Name must be 100 characters or fewer." },
            })}
          />
          {errors.displayName && <FieldDescription role="alert" className="text-destructive">{errors.displayName.message}</FieldDescription>}
        </Field>
        <Field>
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <Input
            id="email"
            type="email"
            placeholder="m@example.com"
            className="bg-background"
            autoComplete="email"
            aria-invalid={Boolean(errors.email)}
            {...register("email", {
              required: "Please enter your email address.",
              pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: "Enter a valid email address." },
              setValueAs: (value: string) => value.trim(),
            })}
          />
          {errors.email ? (
            <FieldDescription role="alert" className="text-destructive">{errors.email.message}</FieldDescription>
          ) : (
            <FieldDescription>We&apos;ll use this to contact you and won&apos;t share it with anyone else.</FieldDescription>
          )}
        </Field>
        <Field>
          <FieldLabel htmlFor="password">Password</FieldLabel>
          <Input
            id="password"
            type="password"
            className="bg-background"
            autoComplete="new-password"
            aria-invalid={Boolean(errors.password)}
            {...register("password", {
              required: "Please choose a password.",
              minLength: { value: 8, message: "Password must be at least 8 characters long." },
            })}
          />
          {errors.password ? (
            <FieldDescription role="alert" className="text-destructive">{errors.password.message}</FieldDescription>
          ) : (
            <FieldDescription>Use at least 8 characters.</FieldDescription>
          )}
        </Field>
        <Field>
          <FieldLabel htmlFor="confirm-password">Confirm Password</FieldLabel>
          <Input
            id="confirm-password"
            type="password"
            className="bg-background"
            autoComplete="new-password"
            aria-invalid={Boolean(errors.confirmPassword)}
            {...register("confirmPassword", {
              required: "Please confirm your password.",
              validate: (value) => value === getValues("password") || "Passwords do not match.",
            })}
          />
          {errors.confirmPassword && <FieldDescription role="alert" className="text-destructive">{errors.confirmPassword.message}</FieldDescription>}
        </Field>
        <Field>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Creating account..." : "Create Account"}
          </Button>
        </Field>
        {errors.root?.server && <p className="auth-error" role="alert">{errors.root.server.message}</p>}
        <FieldSeparator>Or continue with</FieldSeparator>
        <Field>
          <SocialAuthButtons />
          <FieldDescription className="px-6 text-center">
            Already have an account? <Link to="/login">Sign in</Link>
          </FieldDescription>
        </Field>
      </FieldGroup>
    </form>
  );
}
