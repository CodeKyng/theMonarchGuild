import { SignupForm } from "@/components/signup-form"

export default function Signup() {
  return (
    <div className="grid min-h-svh w-full lg:grid-cols-2">
      <div className="flex min-w-0 flex-col gap-4 p-4 sm:p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start">
          <a href="/" className="flex min-w-0 items-center gap-2 font-bold font-heading">
            <div className="flex items-center justify-center rounded-md">
              <img src="/theMonarchGuildLogo.png" alt="" className="size-10 shrink-0 sm:size-12" />
            </div>
            <span className="truncate">The Monarch Guild</span>
          </a>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-sm">
            <SignupForm />
          </div>
        </div>
      </div>
      <div className="relative hidden min-h-svh bg-muted lg:block">
        <img
          src="/theMonarchGuildLogo.png"
          alt="The Monarch Guild Logo"
          className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
        />
      </div>
    </div>
  )
}
