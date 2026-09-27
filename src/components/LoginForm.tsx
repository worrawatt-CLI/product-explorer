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

export default function LoginForm() {
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
      <form
        className="panel login-form"
        onSubmit={handleSubmit(handleLogin)}
        noValidate
      >
        <h1>เข้าสู่ระบบ/login</h1>
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
          {isSubmitting ? "กำลังเข้าสู่ระบบ" : "เข้าสู่ระบบ"}
        </button>

        <div>
          <p>บัญชีมีเเค่นี้</p>
          <ul>
            <li>
              ผู้ดูแลระบบ — <code>admin</code> / <code>admin</code>
            </li>
            <li>
              ผู้ใช้ทั่วไป — <code>user</code> / <code>user</code>
            </li>
          </ul>
        </div>
      </form>
    </main>
  );
}
