"use client";
import React, { useEffect, useState } from "react";
import AdminHeader from "@/components/admin/AdminHeader";
import TablesManager from "@/components/admin/TablesManager";
import Statistics from "@/components/admin/Statistics";
import ReactPaginate from 'react-paginate';
import styles from "@/styles/admin.module.scss";

interface Stats {
  games: number;
  users: number;
  orders: number;
  revenue: number;
  categories: number;
  activeGames: number;
}

export default function AdminPage() {
  const [token, setToken] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [stats, setStats] = useState<Stats | null>(null);
  const [backupLoading, setBackupLoading] = useState(false);
  const [backupError, setBackupError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [touched, setTouched] = useState({ email: false, password: false });
  const [activeTab, setActiveTab] = useState<"management" | "statistics" | "audit">("management");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("admin_token");
      setToken(saved);

      if (saved) {
        loadStats(saved);
      }
    }
  }, []);

  const loadStats = async (token: string) => {
    try {
      const res = await fetch("/api/admin/stats", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (err) {
      console.error("Failed to load stats:", err);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    let isValid = true;
    const newEmailError = {
      required: !email,
      invalid: !isValidEmail(email) && email !== "",
    };
    const newPasswordError = {
      required: !password,
      short: password.length > 0 && password.length < 6,
    };
    
    if (newEmailError.required || newEmailError.invalid) {
      setEmailError(
        newEmailError.required ? "Email обязателен" : "Некорректный email"
      );
      isValid = false;
    }
    
    if (newPasswordError.required || newPasswordError.short) {
      setPasswordError(
        newPasswordError.required
          ? "Пароль обязателен"
          : "Пароль должен содержать минимум 6 символов"
      );
      isValid = false;
    }
    
    if (!isValid) return;

    setLoading(true);
    setLoginError("");
    setEmailError("");
    setPasswordError("");
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (data.token) {
        localStorage.setItem("admin_token", data.token);
        setToken(data.token);
        setEmail("");
        setPassword("");
        loadStats(data.token);
      } else {
        setLoginError(data.error || "Неверный email или пароль");
      }
    } catch (err) {
      setLoginError("Ошибка входа. Попробуйте снова.");
    } finally {
      setLoading(false);
    }
  };

  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleLogout = () => {
    localStorage.removeItem("admin_token");
    setToken(null);
    setEmail("");
    setPassword("");
    setStats(null);
  };

  const createBackup = async () => {
    setBackupLoading(true);
    setBackupError("");

    try {
      const res = await fetch("/api/admin/backup", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Ошибка создания бекапа");
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `backup-${new Date().toISOString().split("T")[0]}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      alert("✅ Бекап успешно создан и скачан!");
    } catch (err) {
      setBackupError(
        err instanceof Error ? err.message : "Ошибка создания бекапа",
      );
    } finally {
      setBackupLoading(false);
    }
  };

  if (!token) {
    return (
      <div className={styles.admin_container} style={{ position: "relative" }}>
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(circle at top right, rgba(131, 180, 255, 0.1) 0%, transparent 50%)",
            pointerEvents: "none",
          }}
        ></div>

        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
            position: "relative",
            zIndex: 1,
          }}
        >
          <div
            style={{
              width: "100%",
              maxWidth: "420px",
              backgroundColor: "#1A1A1A",
              border: "1px solid #262626",
              borderRadius: "12px",
              padding: "40px",
              boxShadow: "0 20px 60px rgba(0, 0, 0, 0.8)",
            }}
          >
            <h2
              style={{
                fontSize: "28px",
                fontWeight: "700",
                marginBottom: "8px",
                color: "#FFFFFF",
                textAlign: "center",
              }}
            >
              📊 Панель администратора
            </h2>
            <p
              style={{
                fontSize: "14px",
                color: "#A1A1A1",
                textAlign: "center",
                marginBottom: "32px",
              }}
            >
              Введите ваши учетные данные
            </p>

            <form
              onSubmit={handleLogin}
              style={{ display: "flex", flexDirection: "column", gap: "16px" }}
            >
              {loginError && (
                <div
                  style={{
                    padding: "12px 16px",
                    backgroundColor: "rgba(255, 131, 131, 0.1)",
                    border: "1px solid #FF8383",
                    borderRadius: "6px",
                    color: "#ff9999",
                    fontSize: "14px",
                  }}
                >
                  {loginError}
                </div>
              )}

              <div>
                <label
                  htmlFor="email"
                  style={{
                    display: "block",
                    fontSize: "13px",
                    fontWeight: "600",
                    marginBottom: "8px",
                    color: "#CCCCCC",
                    textTransform: "uppercase",
                    letterSpacing: "0.3px",
                  }}
                >
                  Эл. почта
                </label>
                <input
                  id="email"
                  type="email"
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    backgroundColor: "#000000",
                    border: `1px solid ${emailError ? "#FF8383" : "#3B3B3B"}`,
                    borderRadius: "6px",
                    color: "#FFFFFF",
                    fontSize: "14px",
                    fontFamily: "inherit",
                    boxSizing: "border-box",
                    transition: "all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = emailError ? "#FF8383" : "#83B4FF";
                    e.currentTarget.style.boxShadow =
                      emailError
                        ? "0 0 0 3px rgba(255, 131, 131, 0.1)"
                        : "0 0 0 3px rgba(131, 180, 255, 0.1)";
                  }}
                  onBlur={(e) => {
                    setTouched({ ...touched, email: true });
                    e.currentTarget.style.borderColor = emailError ? "#FF8383" : "#3B3B3B";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setEmailError("");
                  }}
                />
                {touched.email && emailError && (
                  <p
                    style={{
                      fontSize: "12px",
                      color: "#FF8383",
                      marginTop: "4px",
                      margin: "4px 0 0 0",
                    }}
                  >
                    ⚠️ {emailError}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="password"
                  style={{
                    display: "block",
                    fontSize: "13px",
                    fontWeight: "600",
                    marginBottom: "8px",
                    color: "#CCCCCC",
                    textTransform: "uppercase",
                    letterSpacing: "0.3px",
                  }}
                >
                  Пароль
                </label>
                <input
                  id="password"
                  type="password"
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    backgroundColor: "#000000",
                    border: `1px solid ${passwordError ? "#FF8383" : "#3B3B3B"}`,
                    borderRadius: "6px",
                    color: "#FFFFFF",
                    fontSize: "14px",
                    fontFamily: "inherit",
                    boxSizing: "border-box",
                    transition: "all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = passwordError ? "#FF8383" : "#83B4FF";
                    e.currentTarget.style.boxShadow =
                      passwordError
                        ? "0 0 0 3px rgba(255, 131, 131, 0.1)"
                        : "0 0 0 3px rgba(131, 180, 255, 0.1)";
                  }}
                  onBlur={(e) => {
                    setTouched({ ...touched, password: true });
                    e.currentTarget.style.borderColor = passwordError ? "#FF8383" : "#3B3B3B";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setPasswordError("");
                  }}
                />
                {touched.password && passwordError && (
                  <p
                    style={{
                      fontSize: "12px",
                      color: "#FF8383",
                      marginTop: "4px",
                      margin: "4px 0 0 0",
                    }}
                  >
                    ⚠️ {passwordError}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{
                  padding: "10px 16px",
                  marginTop: "8px",
                  background: loading
                    ? "linear-gradient(135deg, #5b9fff 0%, #3f7dd6 100%)"
                    : "linear-gradient(135deg, #83B4FF 0%, #5b9fff 100%)",
                  color: "#FFFFFF",
                  border: "none",
                  borderRadius: "6px",
                  fontSize: "14px",
                  fontWeight: "700",
                  cursor: loading ? "not-allowed" : "pointer",
                  transition: "all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
                  opacity: loading ? 0.7 : 1,
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                }}
                onMouseEnter={(e) =>
                  !loading &&
                  (e.currentTarget.style.transform = "translateY(-2px)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.transform = "translateY(0)")
                }
              >
                {loading ? "Вход..." : "Войти"}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.admin_container}>
      <AdminHeader onLogout={handleLogout} activeTab={activeTab} onTabChange={setActiveTab} />

      <div className={styles.admin_content}>
        <div className="wrapper">
          
          {activeTab === "management" && (
            <>
              
              <div
                style={{
                  backgroundColor: "#1A1A1A",
                  border: "1px solid #262626",
                  borderRadius: "12px",
                  padding: "24px",
                  marginBottom: "32px",
                }}
              >
                <h3
                  style={{
                    fontSize: "18px",
                    fontWeight: "600",
                    marginBottom: "16px",
                    color: "#FFFFFF",
                  }}
                >
                  💾 Резервное копирование и восстановление
                </h3>

                <p
                  style={{
                    fontSize: "14px",
                    color: "#A1A1A1",
                    marginBottom: "20px",
                    lineHeight: "1.6",
                  }}
                >
                  Создайте резервную копию или восстановите данные из файла бекапа.
                  Файл содержит все таблицы: пользователи, игры, категории, заказы,
                  платежные методы и связанные данные.
                </p>

                {backupError && (
                  <div
                    style={{
                      padding: "12px 16px",
                      backgroundColor: "rgba(255, 131, 131, 0.1)",
                      border: "1px solid #FF8383",
                      borderRadius: "6px",
                      color: "#ff9999",
                      fontSize: "14px",
                      marginBottom: "16px",
                    }}
                  >
                    {backupError}
                  </div>
                )}

                <div
                  style={{
                    display: "flex",
                    gap: "12px",
                    flexWrap: "wrap",
                  }}
                >
                  <button
                    onClick={createBackup}
                    disabled={backupLoading}
                    style={{
                      padding: "12px 24px",
                      background: backupLoading
                        ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                        : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                      color: "#FFFFFF",
                      border: "none",
                      borderRadius: "8px",
                      fontSize: "15px",
                      fontWeight: "600",
                      cursor: backupLoading ? "not-allowed" : "pointer",
                      transition: "all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
                      opacity: backupLoading ? 0.7 : 1,
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                    onMouseEnter={(e) =>
                      !backupLoading &&
                      (e.currentTarget.style.transform = "translateY(-2px)")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.transform = "translateY(0)")
                    }
                  >
                    {backupLoading ? (
                      <>
                        <span
                          style={{
                            display: "inline-block",
                            width: "16px",
                            height: "16px",
                            border: "2px solid #fff",
                            borderRightColor: "transparent",
                            borderRadius: "50%",
                            animation: "spin 1s linear infinite",
                          }}
                        ></span>
                        Создание бекапа...
                      </>
                    ) : (
                      <>💾 Создать бекап</>
                    )}
                  </button>

                  <RestoreButton token={token} onSuccess={createBackup} />
                </div>

                <style>{`
                  @keyframes spin {
                    to { transform: rotate(360deg); }
                  }
                `}</style>
              </div>

              
              <TablesManager />
            </>
          )}

          
          {activeTab === 'audit' && (
            <div style={{ backgroundColor: '#1A1A1A', border: '1px solid #262626', borderRadius: 12, padding: 24 }}>
              <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 12, color: '#FFFFFF' }}>🧾 Журнал аудита</h3>
              <AuditLogs />
            </div>
          )}

          
          {activeTab === "statistics" && <Statistics />}
        </div>
      </div>
    </div>
  );
}

function AuditLogs() {
  const [logs, setLogs] = React.useState<any[]>([]);
  const [page, setPage] = React.useState(1);
  const [total, setTotal] = React.useState(0);
  const pageSize = 20;

  const load = async (p = 1) => {
    try {
      const res = await fetch(`/api/admin/audit?page=${p}&page_size=${pageSize}`);
      if (!res.ok) throw new Error('Failed to load');
      const data = await res.json();
      setLogs(data.results || []);
      setTotal(data.count || 0);
      setPage(data.page || p);
    } catch (e) {
      console.error('Load audit logs error', e);
    }
  };

  useEffect(() => { load(1); }, []);

  const totalPages = Math.ceil(total / pageSize) || 1;

  const renderDetails = (details: any, action: string) => {
    if (!details) return '—';
    if (action === 'create' && details.after) {
      const after = details.after;
      return (
        <div>
          <div style={{ fontWeight: 600, marginBottom: 6 }}>Added:</div>
          <ul style={{ margin: 0, paddingLeft: 16 }}>
            {Object.keys(after).slice(0, 10).map((k) => (
              <li key={k} style={{ color: '#CCCCCC' }}>{k}: {String((after as any)[k])}</li>
            ))}
          </ul>
        </div>
      );
    }

    if (action === 'delete' && details.before) {
      const before = details.before;
      return (
        <div>
          <div style={{ fontWeight: 600, marginBottom: 6 }}>Deleted:</div>
          <ul style={{ margin: 0, paddingLeft: 16 }}>
            {Object.keys(before).slice(0, 10).map((k) => (
              <li key={k} style={{ color: '#CCCCCC' }}>{k}: {String((before as any)[k])}</li>
            ))}
          </ul>
        </div>
      );
    }

    if (details.diff) {
      const entries = Object.entries(details.diff as Record<string, any>);
      if (entries.length === 0) return 'No changes detected';
      return (
        <div>
          <ul style={{ margin: 0, paddingLeft: 16 }}>
            {entries.map(([k, v]: any) => (
              <li key={k} style={{ color: '#CCCCCC' }}>
                <strong style={{ color: '#FFFFFF' }}>{k}</strong>: {String(v.from)} → {String(v.to)}
              </li>
            ))}
          </ul>
        </div>
      );
    }

    return <div style={{ color: '#CCCCCC' }}>{JSON.stringify(details)}</div>;
  };

  return (
    <div>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ textAlign: 'left', color: '#A1A1A1' }}>
            <th style={{ padding: 8 }}>Дата</th>
            <th style={{ padding: 8 }}>Пользователь</th>
            <th style={{ padding: 8 }}>Действие</th>
            <th style={{ padding: 8 }}>Сущность</th>
            <th style={{ padding: 8 }}>Детали</th>
          </tr>
        </thead>
        <tbody>
          {logs.map((l) => (
            <tr key={l.id} style={{ borderTop: '1px solid #2a2a2a' }}>
              <td style={{ padding: 8, color: '#CCCCCC' }}>{new Date(l.createdAt).toLocaleString()}</td>
              <td style={{ padding: 8, color: '#CCCCCC' }}>{l.user ? (l.user.email || l.user.login) : '—'}</td>
              <td style={{ padding: 8, color: '#CCCCCC' }}>{l.action}</td>
              <td style={{ padding: 8, color: '#CCCCCC' }}>{l.entity}{l.entityId ? ` #${l.entityId}` : ''}</td>
              <td style={{ padding: 8, color: '#CCCCCC' }}>{renderDetails(l.details, l.action)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div style={{ marginTop: 12, display: 'flex', gap: 8, alignItems: 'center' }}>
        <button disabled={page <= 1} onClick={() => { load(page - 1); }} style={{ padding: '6px 10px' }}>‹ Prev</button>
        <div style={{ color: '#CCCCCC' }}>Страница {page} из {totalPages}</div>
        <button disabled={page >= totalPages} onClick={() => { load(page + 1); }} style={{ padding: '6px 10px' }}>Next ›</button>
      </div>
    </div>
  );
}

function RestoreButton({
  token,
  onSuccess,
}: {
  token: string | null;
  onSuccess: () => void;
}): React.JSX.Element {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleRestore = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.currentTarget.files?.[0];
    if (!file) return;

    if (!file.name.includes("backup")) {
      setError("Пожалуйста, выберите файл бекапа");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/admin/restore", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Ошибка восстановления");
      }

      alert(
        "✅ Данные успешно восстановлены! Страница перезагрузится через 3 секунды."
      );
      setTimeout(() => {
        window.location.reload();
      }, 3000);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Ошибка восстановления данных"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ position: "relative" }}>
      <input
        type="file"
        accept=".json"
        onChange={handleRestore}
        disabled={loading}
        style={{
          display: "none",
        }}
        id="restore-input"
      />
      <label
        htmlFor="restore-input"
        style={{
          padding: "12px 24px",
          background: loading
            ? "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)"
            : "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
          color: "#FFFFFF",
          border: "none",
          borderRadius: "8px",
          fontSize: "15px",
          fontWeight: "600",
          cursor: loading ? "not-allowed" : "pointer",
          transition: "all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
          opacity: loading ? 0.7 : 1,
          display: "inline-flex",
          alignItems: "center",
          gap: "8px",
        }}
        onMouseEnter={(e) => {
          if (!loading) {
            e.currentTarget.style.transform = "translateY(-2px)";
          }
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "translateY(0)";
        }}
      >
        {loading ? (
          <>
            <span
              style={{
                display: "inline-block",
                width: "16px",
                height: "16px",
                border: "2px solid #fff",
                borderRightColor: "transparent",
                borderRadius: "50%",
                animation: "spin 1s linear infinite",
              }}
            ></span>
            Восстановление...
          </>
        ) : (
          <>📂 Восстановить из файла</>
        )}
      </label>
      {error && (
        <p
          style={{
            color: "#FF8383",
            fontSize: "12px",
            marginTop: "8px",
          }}
        >
          ⚠️ {error}
        </p>
      )}
    </div>
  );
}
