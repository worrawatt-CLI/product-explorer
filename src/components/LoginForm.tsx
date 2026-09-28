"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { homePath, login, useAuth } from "@/lib/auth";

const LoginSchema = z.object({
  username: z.string().trim().min(1, "กรุณากรอกชื่อผู้ใช้"),
  password: z.string().min(1, "กรุณากรอกรหัสผ่าน"),
});

type LoginInput = z.infer<typeof LoginSchema>;

type LoginFormProps = {
  // Server Action สำหรับเข้าสู่ระบบด้วย Google (ส่งมาจาก login/page.tsx ฝั่ง server)
  googleSignIn: () => Promise<void>;
};

export default function LoginForm({ googleSignIn }: LoginFormProps) {
  const router = useRouter();
  const { session, hydrated } = useAuth();

  const [authError, setAuthError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(LoginSchema),
    mode: "onTouched",
    defaultValues: { username: "", password: "" },
  });

  useEffect(() => {
    if (hydrated && session) {
      router.replace(homePath(session.role));
    }
  }, [hydrated, session, router]);

  function handleLogin(values: LoginInput) {
    const result = login(values.username, values.password);

    if (!result) {
      setAuthError("ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง");
      return;
    }

    router.replace(homePath(result.role));
  }

  return (
    <main className="login-page">
      <div className="panel login-alt">
        <h1>เข้าสู่ระบบ</h1>
        <p className="login-sub">
          เข้าสู่ระบบด้วยบัญชี Google
        </p>
        <form action={googleSignIn} className="google-form">
          <button type="submit" className="google-btn">
            <svg
              className="google-icon"
              width="18"
              height="18"
              viewBox="0 0 18 18"
              aria-hidden="true"
            >
              <path
                fill="#4285F4"
                d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92c1.71-1.57 2.68-3.89 2.68-6.62z"
              />
              <path
                fill="#34A853"
                d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.81.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.03-3.7H.96v2.33A9 9 0 0 0 9 18z"
              />
              <path
                fill="#FBBC05"
                d="M3.97 10.72a5.41 5.41 0 0 1 0-3.44V4.95H.96a9 9 0 0 0 0 8.1l3.01-2.33z"
              />
              <path
                fill="#EA4335"
                d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58C13.47.9 11.43 0 9 0A9 9 0 0 0 .96 4.95l3.01 2.33C4.68 5.16 6.66 3.58 9 3.58z"
              />
            </svg>
            <span>เข้าสู่ระบบด้วย Google</span>
          </button>
        </form>
      </div>

      <form
        className="panel login-form"
        onSubmit={handleSubmit(handleLogin)}
        noValidate
      >
        <div>
          <span>หรือเข้าสู่ระบบผู้ดูแลระบบ(version ทดสอบ)</span>
        </div>

        <div className="field">
          <label htmlFor="username">ชื่อผู้ใช้/username</label>
          <input
            id="username"
            autoComplete="username"
            {...register("username")}
            aria-invalid={!!errors.username}
            aria-describedby="username-error"
          />
          <span id="username-error" role="alert" className="field-error">
            {errors.username?.message}
          </span>
        </div>

        <div className="field">
          <label htmlFor="password">รหัสผ่าน/passw</label>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            {...register("password")}
            aria-invalid={!!errors.password}
            aria-describedby="password-error"
          />
          <span id="password-error" role="alert" className="field-error">
            {errors.password?.message}
          </span>
        </div>

        {authError && (
          <p className="login-alert" role="alert">
            {authError}
          </p>
        )}

        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "กำลังเข้าสู่ระบบ" : "เข้าสู่ระบบผู้ดูแลระบบ"}
        </button>

        <div>
          <p>บัญชีผู้ดูแลระบบ</p>
          <ul>
            <li>
              ผู้ดูแลระบบ — <code>admin</code> / <code>admin</code>
            </li>
          </ul>
        </div>
      </form>
    </main>
  );
}
