import { cn } from "cn";
import { useForm, type SubmitHandler } from "react-hook-form";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
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

interface LoginValues {
  email: string;
  password: string;
}

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  const { user, role, loading } = useAuth();
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    setError,
    clearErrors,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({
    mode: "onBlur",
    defaultValues: { email: "", password: "" },
  });

  if (loading) return <p>Loading...</p>;
  if (user && role) return <Navigate to={`/${role}`} replace />;
  if (user && !role) return <Navigate to="/access-denied" replace />;

  const onSubmit: SubmitHandler<LoginValues> = async ({ email, password }) => {
    clearErrors("root.server");

    try {
      const credential = await signInWithEmailAndPassword(auth, email.trim(), password);
      const snapshot = await getDoc(doc(db, "users", credential.user.uid));
      const userRole = snapshot.data()?.role;

      if (!snapshot.exists() || !["admin", "staff", "member"].includes(userRole)) {
        await auth.signOut();
        setError("root.server", {
          type: "server",
          message: "Your account has no valid role. Contact support.",
        });
        return;
      }

      navigate(`/${userRole}`, { replace: true });
    } catch {
      setError("root.server", {
        type: "server",
        message: "Login failed. Check your email and password.",
      });
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
          <h1 className="text-2xl font-bold">Login to your account</h1>
          <p className="text-sm text-balance text-muted-foreground">
            Sign in to continue with your Web3 community.
          </p>
        </div>
        <Field>
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <Input
            id="email"
            type="email"
            placeholder="m@example.com"
            autoComplete="email"
            aria-invalid={Boolean(errors.email)}
            {...register("email", {
              required: "Please enter your email address.",
              pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: "Enter a valid email address." },
              setValueAs: (value: string) => value.trim(),
            })}
          />
          {errors.email && <FieldDescription role="alert" className="text-destructive">{errors.email.message}</FieldDescription>}
        </Field>
        <Field>
          <div className="flex items-center">
            <FieldLabel htmlFor="password">Password</FieldLabel>
            <a
              href="#"
              className="ml-auto text-sm underline-offset-4 hover:underline"
            >
              Forgot your password?
            </a>
          </div>
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            aria-invalid={Boolean(errors.password)}
            {...register("password", { required: "Please enter your password." })}
          />
          {errors.password && <FieldDescription role="alert" className="text-destructive">{errors.password.message}</FieldDescription>}
        </Field>
        <Field>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Signing in..." : "Log In"}
          </Button>
        </Field>
        {errors.root?.server && <p role="alert" className="text-lg text-red-600">{errors.root.server.message}</p>}
        <FieldSeparator>Or continue with</FieldSeparator>
        <Field>
          <SocialAuthButtons />
          <FieldDescription className="text-center">
            Don&apos;t have an account?{" "}
            <Link to="/signup" className="underline underline-offset-4">
              Sign up
            </Link>
          </FieldDescription>
        </Field>
      </FieldGroup>
    </form>
  );
}
