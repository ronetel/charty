"use client";
import React, { useEffect, useState } from "react";
import AdminHeader from "@/components/admin/AdminHeader";
import TablesManager from "@/components/admin/TablesManager";
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
    setLoading(true);
    setLoginError("");
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
                  required
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    backgroundColor: "#000000",
                    border: "1px solid #3B3B3B",
                    borderRadius: "6px",
                    color: "#FFFFFF",
                    fontSize: "14px",
                    fontFamily: "inherit",
                    boxSizing: "border-box",
                    transition: "all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = "#83B4FF";
                    e.currentTarget.style.boxShadow =
                      "0 0 0 3px rgba(131, 180, 255, 0.1)";
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = "#3B3B3B";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
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
                  required
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    backgroundColor: "#000000",
                    border: "1px solid #3B3B3B",
                    borderRadius: "6px",
                    color: "#FFFFFF",
                    fontSize: "14px",
                    fontFamily: "inherit",
                    boxSizing: "border-box",
                    transition: "all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = "#83B4FF";
                    e.currentTarget.style.boxShadow =
                      "0 0 0 3px rgba(131, 180, 255, 0.1)";
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = "#3B3B3B";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
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
      <AdminHeader onLogout={handleLogout} />

      <div className={styles.admin_content}>
        <div className="wrapper">
          {/* Статистика */}
          {stats && (
            <div style={{ marginBottom: "32px" }}>
              <h2
                style={{
                  fontSize: "24px",
                  fontWeight: "700",
                  marginBottom: "20px",
                  color: "#FFFFFF",
                }}
              >
                📊 Статистика базы данных
              </h2>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                  gap: "20px",
                  marginBottom: "24px",
                }}
              >
                <StatCard
                  title="Всего игр"
                  value={stats.games}
                  icon="🎮"
                  color="#FF6B6B"
                />
                <StatCard
                  title="Активных игр"
                  value={stats.activeGames}
                  icon="✅"
                  color="#4ECDC4"
                />
                <StatCard
                  title="Категорий"
                  value={stats.categories}
                  icon="📁"
                  color="#45B7D1"
                />
                <StatCard
                  title="Пользователей"
                  value={stats.users}
                  icon="👥"
                  color="#95E1D3"
                />
                <StatCard
                  title="Заказов"
                  value={stats.orders}
                  icon="📦"
                  color="#F368E0"
                />
                <StatCard
                  title="Выручка"
                  value={`₽${Number(stats.revenue).toLocaleString()}`}
                  icon="💰"
                  color="#FFD166"
                />
              </div>
            </div>
          )}

          {/* Бекап */}
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
              💾 Резервное копирование базы данных
            </h3>

            <p
              style={{
                fontSize: "14px",
                color: "#A1A1A1",
                marginBottom: "20px",
                lineHeight: "1.6",
              }}
            >
              Создайте полную резервную копию базы данных. Файл будет содержать
              все таблицы: пользователи, игры, категории, заказы, платежные
              методы и связанные данные.
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

            <style>{`
              @keyframes spin {
                to { transform: rotate(360deg); }
              }
            `}</style>
          </div>

          {/* Менеджер таблиц */}
          <TablesManager />
        </div>
      </div>
    </div>
  );
}

// Компонент карточки статистики
function StatCard({
  title,
  value,
  icon,
  color,
}: {
  title: string;
  value: number | string;
  icon: string;
  color: string;
}) {
  return (
    <div
      style={{
        backgroundColor: "#1A1A1A",
        border: "1px solid #262626",
        borderRadius: "12px",
        padding: "20px",
        transition: "all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
        cursor: "default",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: "12px",
        }}
      >
        <span
          style={{
            fontSize: "28px",
            lineHeight: "1",
          }}
        >
          {icon}
        </span>
        <span
          style={{
            fontSize: "12px",
            color: "#A1A1A1",
            fontWeight: "500",
          }}
        >
          {title}
        </span>
      </div>

      <div
        style={{
          fontSize: "32px",
          fontWeight: "700",
          color: "#FFFFFF",
          lineHeight: "1.2",
        }}
      >
        {value}
      </div>
    </div>
  );
}
