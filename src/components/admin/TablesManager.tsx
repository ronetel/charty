"use client";
import React, { useEffect, useState } from "react";
import fetchWithTiming from "@/lib/fetchWithTiming";
import styles from "@/styles/admin.module.scss";

// Import new components
import { TableTabs } from "./tables/components/TableTabs";
import { TableHeader } from "./tables/components/TableHeader";
import { AlertMessages } from "./tables/components/AlertMessages";
import { TableRows } from "./tables/components/TableRows";
import { TablePagination } from "./tables/components/TablePagination";
import { FormModal } from "./tables/components/FormModal";

// Import types, constants, schemas, utils
import { TableName, FormData, PaginationData } from "./tables/types";
import { TABLE_LABELS } from "./tables/constants";
import { validationSchemas } from "./tables/schemas";
import { getTokenHeader, formatDateForInput } from "./tables/utils";

export default function TablesManager() {
  const [active, setActive] = useState<TableName>("products");
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<FormData>({});
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [expandedDescriptions, setExpandedDescriptions] = useState<Record<number, boolean>>({});

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Search and filter
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Сортировка
  const [sortBy, setSortBy] = useState<string>("id");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
    setCurrentPage(1);
  };

  useEffect(() => {
    setCurrentPage(1);
    setSearchQuery("");
    setDebouncedSearch("");
  }, [active]);

  // Debounce search input to avoid rapid requests
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchQuery), 300);
    return () => clearTimeout(t);
  }, [searchQuery]);

  useEffect(() => {
    fetchList();
  }, [active, currentPage, debouncedSearch, pageSize, sortBy, sortOrder]);

  const fetchList = async () => {
    setLoading(true);
    setErrorMessage("");
    try {
      let url = `/api/admin/${active}?page=${currentPage}&page_size=${pageSize}`;
      if (debouncedSearch) {
        url += `&search=${encodeURIComponent(debouncedSearch)}`;
      }
      if (sortBy) {
        url += `&sortBy=${encodeURIComponent(sortBy)}&sortOrder=${sortOrder}`;
      }

      const res = await fetchWithTiming(url, {
        headers: getTokenHeader(),
      });
      if (!res.ok) throw new Error("Failed to fetch");
      const json: PaginationData = await res.json();
      setData(json.results || []);
      setTotalCount(json.count || 0);
      setTotalPages(json.total_pages || 1);
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
    setValidationErrors({});
  };

  const handleOpenAddForm = () => {
    setFormData({});
    setEditingId(null);
    setIsFormOpen(true);
    setValidationErrors({});
  };

  const handleOpenEditForm = (item: any) => {
    const processedItem = { ...item };
    if (item.releasedDate) {
      processedItem.releasedDate = formatDateForInput(item.releasedDate);
    }
    setFormData(processedItem);
    setEditingId(item.id);
    setIsFormOpen(true);
    setValidationErrors({});
  };

  const handleSubmitForm = async (data: FormData) => {
    setErrorMessage("");
    setSuccessMessage("");
    setValidationErrors({});

    // Валидация
    const schema = validationSchemas[active];
    const parseResult = schema.safeParse(data);

    if (!parseResult.success) {
      const errors: Record<string, string> = {};
      parseResult.error.issues.forEach((issue: any) => {
        const path = issue.path.join(".");
        errors[path] = issue.message;
      });
      setValidationErrors(errors);
      return;
    }

    try {
      const method = editingId ? "PUT" : "POST";
      const url = editingId
        ? `/api/admin/${active}/${editingId}`
        : `/api/admin/${active}`;

      const res = await fetch(url, {
        method,
        headers: getTokenHeader(),
        body: JSON.stringify(parseResult.data),
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

  const handleDelete = async (item: any) => {
    if (!confirm(`Вы уверены, что хотите удалить этот элемент?`)) return;

    setErrorMessage("");
    setSuccessMessage("");

    try {
      const res = await fetch(`/api/admin/${active}/${item.id}`, {
        method: "DELETE",
        headers: getTokenHeader(),
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

  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize);
    setCurrentPage(1);
  };


  return (
    <section className={styles.tables_section}>
      <TableTabs active={active} onTabChange={setActive} />

      <div className={styles.table_content}>
        <AlertMessages 
          errorMessage={errorMessage}
          successMessage={successMessage}
          validationErrors={Object.values(validationErrors)}
        />

        <TableHeader
          activeTable={active}
          searchQuery={searchQuery}
          pageSize={pageSize}
          onSearchChange={setSearchQuery}
          onAddClick={handleOpenAddForm}
          onPageSizeChange={handlePageSizeChange}
        />

        <TablePagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalCount={totalCount}
          loading={loading}
          hasData={data.length > 0}
          onPageChange={setCurrentPage}
        />

        <div className={styles.table_wrapper}>
          <div className={styles.table_list}>
            <TableRows
              activeTable={active}
              data={data}
              currentPage={currentPage}
              pageSize={pageSize}
              sortBy={sortBy}
              sortOrder={sortOrder}
              expandedDescriptions={expandedDescriptions}
              loading={loading}
              onExpandDescription={(rowId) => 
                setExpandedDescriptions(prev => ({
                  ...prev,
                  [rowId]: !prev[rowId]
                }))
              }
              onEdit={handleOpenEditForm}
              onDelete={handleDelete}
              onSort={handleSort}
            />
          </div>
        </div>
      </div>

      <FormModal
        isOpen={isFormOpen}
        title={
          editingId
            ? `Редактировать ${TABLE_LABELS[active]}`
            : `Создать ${TABLE_LABELS[active]}`
        }
        activeTable={active}
        initialData={formData}
        isLoading={loading}
        validationErrors={validationErrors}
        onClose={resetForm}
        onSubmit={handleSubmitForm}
      />
    </section>
  );
}
