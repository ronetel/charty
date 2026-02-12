"use client";
import React, { useEffect, useState } from "react";
import styles from "@/styles/admin.module.scss";
import {
  MdDeleteOutline,
  MdModeEditOutline,
  MdAdd,
  MdClose,
} from "react-icons/md";

type TableName =
  | "products"
  | "categories"
  | "users"
  | "roles"
  | "orders"
  | "paymentMethods";

const TABLES: TableName[] = [
  "products",
  "categories",
  "users",
  "roles",
  "orders",
  "paymentMethods",
];

const TABLE_LABELS: Record<TableName, string> = {
  products: "Товары",
  categories: "Категории",
  users: "Пользователи",
  roles: "Роли",
  orders: "Заказы",
  paymentMethods: "Способы оплаты",
};

const TABLE_FIELDS: Record<TableName, string[]> = {
  products: ["name", "description", "price", "stockQuantity"],
  categories: ["name", "description"],
  users: ["email", "login", "isActive"],
  roles: ["name"],
  orders: ["status", "totalAmount"],
  paymentMethods: ["methodType", "maskedData", "isDefault"],
};

interface FormData {
  [key: string]: string | number | boolean;
}

export default function TablesManager() {
  const [active, setActive] = useState<TableName>("products");
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<FormData>({});
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    fetchList();
  }, [active]);

  const tokenHeader = () => {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("admin_token");
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }
    }
    return headers;
  };

  const fetchList = async () => {
    setLoading(true);
    setErrorMessage("");
    try {
      const res = await fetch(`/api/admin/${active}`, {
        headers: tokenHeader(),
      });
      if (!res.ok) throw new Error("Failed to fetch");
      const json = await res.json();
      setData(json.results || json || []);
    } catch (e) {
      console.error(e);
      setErrorMessage("Ошибка при загрузке данных");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({});
    setEditingId(null);
    setIsFormOpen(false);
    setErrorMessage("");
  };

  const handleOpenAddForm = () => {
    setFormData({});
    setEditingId(null);
    setIsFormOpen(true);
    setErrorMessage("");
  };

  const handleOpenEditForm = (item: any) => {
    setFormData({ ...item });
    setEditingId(item.id);
    setIsFormOpen(true);
    setErrorMessage("");
  };

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const method = editingId ? "PUT" : "POST";
      const url = editingId
        ? `/api/admin/${active}/${editingId}`
        : `/api/admin/${active}`;

      const res = await fetch(url, {
        method,
        headers: tokenHeader(),
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Operation failed");
      }

      const message = editingId
        ? `${TABLE_LABELS[active]} успешно обновлён`
        : `${TABLE_LABELS[active]} успешно создан`;
      setSuccessMessage(message);

      setTimeout(() => {
        resetForm();
        fetchList();
        setSuccessMessage("");
      }, 1500);
    } catch (e) {
      console.error(e);
      setErrorMessage(
        `Ошибка: ${e instanceof Error ? e.message : "Unknown error"}`,
      );
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm(`Вы уверены, что хотите удалить этот элемент?`)) return;

    setErrorMessage("");
    setSuccessMessage("");

    try {
      const res = await fetch(`/api/admin/${active}/${id}`, {
        method: "DELETE",
        headers: tokenHeader(),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Delete failed");
      }

      setSuccessMessage("Элемент успешно удален");
      setTimeout(() => {
        fetchList();
        setSuccessMessage("");
      }, 1000);
    } catch (e) {
      console.error(e);
      setErrorMessage(
        `Ошибка при удалении: ${e instanceof Error ? e.message : "Unknown error"}`,
      );
    }
  };

  const renderFormField = (fieldName: string) => {
    const value = formData[fieldName];

    if (active === "users" && fieldName === "isActive") {
      return (
        <div key={fieldName} className={styles.form_group}>
          <label>Активный</label>
          <select
            value={String(value === true || value === "true")}
            onChange={(e) =>
              setFormData({
                ...formData,
                [fieldName]: e.target.value === "true",
              })
            }
          >
            <option value="true">Да</option>
            <option value="false">Нет</option>
          </select>
        </div>
      );
    }

    if (active === "paymentMethods" && fieldName === "isDefault") {
      return (
        <div key={fieldName} className={styles.form_group}>
          <label>По умолчанию</label>
          <select
            value={String(value === true || value === "true")}
            onChange={(e) =>
              setFormData({
                ...formData,
                [fieldName]: e.target.value === "true",
              })
            }
          >
            <option value="true">Да</option>
            <option value="false">Нет</option>
          </select>
        </div>
      );
    }

    if (fieldName === "description") {
      return (
        <div key={fieldName} className={styles.form_group}>
          <label>{getLabelForField(fieldName)}</label>
          <textarea
            value={String(value || "")}
            onChange={(e) =>
              setFormData({ ...formData, [fieldName]: e.target.value })
            }
            placeholder={`Введите ${getLabelForField(fieldName).toLowerCase()}`}
          />
        </div>
      );
    }

    if (
      fieldName === "price" ||
      fieldName === "stockQuantity" ||
      fieldName === "totalAmount"
    ) {
      return (
        <div key={fieldName} className={styles.form_group}>
          <label>{getLabelForField(fieldName)}</label>
          <input
            type="number"
            step={
              fieldName === "price" || fieldName === "totalAmount"
                ? "0.01"
                : "1"
            }
            value={String(value || "")}
            onChange={(e) =>
              setFormData({ ...formData, [fieldName]: e.target.value })
            }
            placeholder={`Введите ${getLabelForField(fieldName).toLowerCase()}`}
          />
        </div>
      );
    }

    return (
      <div key={fieldName} className={styles.form_group}>
        <label>{getLabelForField(fieldName)}</label>
        <input
          type={fieldName === "email" ? "email" : "text"}
          value={String(value || "")}
          onChange={(e) =>
            setFormData({ ...formData, [fieldName]: e.target.value })
          }
          placeholder={`Введите ${getLabelForField(fieldName).toLowerCase()}`}
          required
        />
      </div>
    );
  };

  const getLabelForField = (field: string): string => {
    const labels: Record<string, string> = {
      name: "Название",
      description: "Описание",
      price: "Цена",
      stockQuantity: "Количество на складе",
      email: "Email",
      login: "Логин",
      isActive: "Активный",
      status: "Статус",
      totalAmount: "Сумма",
      methodType: "Тип платежа",
      maskedData: "Скрытые данные",
      isDefault: "По умолчанию",
    };
    return labels[field] || field;
  };

  const renderRowData = (row: any) => {
    if (active === "products") {
      return `${row.name} — ${row.price}`;
    } else if (active === "users") {
      return `${row.email} (${row.login || "N/A"})`;
    } else if (active === "categories" || active === "roles") {
      return row.name;
    } else if (active === "orders") {
      return `${row.status} — ${row.totalAmount}₽`;
    } else if (active === "paymentMethods") {
      return `${row.methodType} — ${row.maskedData}`;
    } else {
      return `ID: ${row.id}`;
    }
  };

  return (
    <section className={styles.tables_section}>
      <div className={styles.table_tabs}>
        {TABLES.map((t) => (
          <button
            key={t}
            onClick={() => setActive(t)}
            className={`${styles.table_tab} ${active === t ? styles.active : ""}`}
          >
            {TABLE_LABELS[t]}
          </button>
        ))}
      </div>

      <div className={styles.table_content}>
        {errorMessage && (
          <div className={styles.error_message}>{errorMessage}</div>
        )}

        {successMessage && (
          <div className={styles.success_message}>{successMessage}</div>
        )}

        <div className={styles.table_header}>
          <h3>{TABLE_LABELS[active]}</h3>
          <button
            className={styles.submit_btn}
            onClick={handleOpenAddForm}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              marginLeft: "auto",
              width: "auto",
              padding: "10px 16px",
            }}
          >
            <MdAdd size={20} />
            Добавить
          </button>
        </div>

        <div className={styles.table_wrapper}>
          {}
          <div className={styles.table_list}>
            {loading ? (
              <div className={styles.table_loading}>
                <span className={styles.loading_spinner}></span>
                <p style={{ marginTop: "12px" }}>Загрузка данных...</p>
              </div>
            ) : (
              <>
                {data.length === 0 ? (
                  <div className={styles.table_empty}>
                    Записей не найдено. Создайте первый элемент, используя
                    форму.
                  </div>
                ) : (
                  <table>
                    <thead>
                      <tr>
                        <th style={{ width: "60px" }}>ID</th>
                        <th>Данные</th>
                        <th style={{ width: "120px", textAlign: "right" }}>
                          Действия
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.map((row) => (
                        <tr key={row.id}>
                          <td>#{row.id}</td>
                          <td>{renderRowData(row)}</td>
                          <td>
                            <div className={styles.table_actions}>
                              <button
                                className={styles.edit_btn}
                                onClick={() => handleOpenEditForm(row)}
                                title="Редактировать"
                              >
                                <MdModeEditOutline size={16} />
                              </button>
                              <button
                                className={styles.delete_btn}
                                onClick={() => handleDelete(row.id)}
                                title="Удалить"
                              >
                                <MdDeleteOutline size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </>
            )}
          </div>

          {}
          {isFormOpen && (
            <div
              style={{
                position: "fixed",
                inset: 0,
                backgroundColor: "rgba(0, 0, 0, 0.8)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 1000,
              }}
            >
              <div
                className={styles.form_container}
                style={{
                  maxWidth: "500px",
                  width: "100%",
                  margin: "20px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "16px",
                  }}
                >
                  <h4 className={styles.form_title}>
                    {editingId
                      ? `Редактировать ${TABLE_LABELS[active]}`
                      : `Создать ${TABLE_LABELS[active]}`}
                  </h4>
                  <button
                    onClick={resetForm}
                    style={{
                      background: "none",
                      border: "none",
                      color: "#A1A1A1",
                      cursor: "pointer",
                      fontSize: "24px",
                      padding: "0",
                    }}
                    title="Закрыть"
                  >
                    <MdClose />
                  </button>
                </div>

                <form onSubmit={handleSubmitForm}>
                  {TABLE_FIELDS[active].map((field) => renderFormField(field))}

                  <div className={styles.form_actions}>
                    <button type="submit" className={styles.submit_btn}>
                      {editingId ? "Сохранить" : "Создать"}
                    </button>
                    <button
                      type="button"
                      className={styles.cancel_btn}
                      onClick={resetForm}
                    >
                      Отменить
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
