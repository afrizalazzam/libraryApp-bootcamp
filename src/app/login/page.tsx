"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import { BookyLogo } from "@/components/booky-logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLoginMutation } from "@/lib/api/auth";
import { useAppDispatch } from "@/lib/redux/hooks";
import { setCredentials } from "@/lib/redux/features/authSlice";
import { saveSession } from "@/lib/auth-storage";
import { useToast } from "@/components/ui/toast";

type FormErrors = {
  email?: string;
  password?: string;
};

function validate(email: string, password: string): FormErrors {
  const errors: FormErrors = {};

  if (!email.trim()) {
    errors.email = "Email is required.";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email = "Enter a valid email address.";
  }

  if (!password) {
    errors.password = "Password is required.";
  } else if (password.length < 6) {
    errors.password = "Password must be at least 6 characters.";
  }

  return errors;
}

export default function LoginPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { showToast } = useToast();
  const loginMutation = useLoginMutation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors = validate(email, password);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    loginMutation.mutate(
      { email, password },
      {
        onSuccess: ({ token, user }) => {
          saveSession(token, user);
          dispatch(setCredentials({ token, user }));
          showToast(`Welcome back, ${user.name}.`);
          router.push(user.role === "ADMIN" ? "/admin/users" : "/");
        },
        onError: (err) => showToast(err.message, "error"),
      }
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-md">
        <BookyLogo />

        <h1 className="text-display-sm font-bold text-foreground">Login</h1>
        <p className="mt-2 text-md text-muted-foreground">
          Sign in to manage your library account.
        </p>

        {loginMutation.isError && (
          <p className="mt-4 rounded-lg bg-destructive/10 px-4 py-3 text-md text-destructive">
            {loginMutation.error.message}
          </p>
        )}

        <form
          onSubmit={handleSubmit}
          noValidate
          className="mt-8 flex flex-col gap-5"
        >
          <div className="flex flex-col gap-2">
            <Label htmlFor="email" className="text-md">Email</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => {
                setEmail(event.target.value);
                setErrors((prev) => ({ ...prev, email: undefined }));
                loginMutation.reset();
              }}
              aria-invalid={!!errors.email}
              className="h-13 rounded-xl px-4 text-base"
            />
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email}</p>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="password" className="text-md">Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                value={password}
                onChange={(event) => {
                  setPassword(event.target.value);
                  setErrors((prev) => ({ ...prev, password: undefined }));
                  loginMutation.reset();
                }}
                aria-invalid={!!errors.password}
                className="h-13 rounded-xl px-4 text-base pr-12"
              />
              <button
                type="button"
                onClick={() => setShowPassword((value) => !value)}
                className="absolute top-1/2 right-4 -translate-y-1/2 text-muted-foreground"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <EyeOff className="size-5" />
                ) : (
                  <Eye className="size-5" />
                )}
              </button>
            </div>
            {errors.password && (
              <p className="text-sm text-destructive">{errors.password}</p>
            )}
          </div>

          <Button
            type="submit"
            size="lg"
            disabled={loginMutation.isPending}
            className="mt-2 h-13 rounded-full text-base"
          >
            {loginMutation.isPending ? "Logging in..." : "Login"}
          </Button>
        </form>

        <p className="mt-6 text-center text-md text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="text-primary hover:underline">
            Register
          </Link>
        </p>
      </div>
    </main>
  );
}
