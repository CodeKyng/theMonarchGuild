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
import { Link, Navigate, useNavigate } from "react-router-dom"
import { useState, type FormEvent } from "react"
import { useAuth } from "@/auth/AuthContext"
import { signInWithEmailAndPassword } from "firebase/auth"
import { doc, getDoc } from "firebase/firestore"
import { auth, db } from "../firebase"
import SocialAuthButtons from "./social-auth"

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  const { user, role, loading } = useAuth()
  const navigate = useNavigate()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [submitting, setSubmitting] = useState(false)

  if (loading) return <p>Loading...</p>

  if (user && role) {
    return <Navigate to={`/${role}`} replace />
  }

  if (user && !role) {
    return <Navigate to="/access-denied" replace />
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError("")
    setSubmitting(true)

    try {
      const credential = await signInWithEmailAndPassword(auth, email, password)

      const snapshot = await getDoc(doc(db, "users", credential.user.uid))

      const userRole = snapshot.data()?.role

      if (
        !snapshot.exists() ||
        !["admin", "staff", "member"].includes(userRole)
      ) {
        await auth.signOut()
        setError("Your account has no valid role. Contact support.")
        return
      }

      navigate(`/${userRole}`, { replace: true })
    } catch {
      setError("Login failed. Check your email and password.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className={cn("flex flex-col gap-6", className)} {...props}>
      <FieldGroup>
        <div className="flex flex-col items-center gap-1 text-center">
          <h1 className="text-2xl font-bold">Login to your account</h1>
          <p className="text-sm text-balance text-muted-foreground">
            Enter your email below to login to your account
          </p>
        </div>
        <Field>
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <Input
            id="email"
            type="email"
            placeholder="m@example.com"
            required
            autoComplete="username"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
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
            required
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </Field>
        <Field>
          <Button type="submit" disabled={submitting}>
            {submitting ? "Signing in..." : "Log In"}
          </Button>
        </Field>
        {error && <p role="alert" className="text-red-600 text-lg">{error}</p>}
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
  )
}
