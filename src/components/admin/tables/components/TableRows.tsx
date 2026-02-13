import React from "react";
import { MdModeEditOutline, MdDeleteOutline } from "react-icons/md";
import { TableName } from "../types";
import { TABLE_FIELDS, FIELD_LABELS } from "../constants";
import { TableCell } from "./TableCell";
import styles from "@/styles/admin.module.scss";

interface TableRowsProps {
  activeTable: TableName;
  data: any[];
  currentPage: number;
  pageSize: number;
  sortBy: string;
  sortOrder: "asc" | "desc";
  expandedDescriptions: Record<number, boolean>;
  loading: boolean;
  onExpandDescription: (rowId: number) => void;
  onEdit: (item: any) => void;
  onDelete: (item: any) => void;
  onSort: (field: string) => void;
}

export const TableRows: React.FC<TableRowsProps> = ({
  activeTable,
  data,
  currentPage,
  pageSize,
  sortBy,
  sortOrder,
  expandedDescriptions,
  loading,
  onExpandDescription,
  onEdit,
  onDelete,
  onSort,
}) => {
  const fields = TABLE_FIELDS[activeTable];

  const renderSortIcon = (fieldName: string) => {
    if (sortBy !== fieldName) {
      return <span style={{ marginLeft: 4, color: "#D1D5DB" }}>⇅</span>;
    }
    return <span style={{ marginLeft: 4 }}>{sortOrder === "asc" ? "↑" : "↓"}</span>;
  };

  return (
    <table>
      <thead>
        <tr>
          <th onClick={() => onSort("id")} style={{ cursor: "pointer", userSelect: "none" }}>
            <div style={{ display: "flex", alignItems: "center" }}>
              ID {renderSortIcon("id")}
            </div>
          </th>
          {fields.map((field) => (
            <th
              key={field}
              onClick={() => onSort(field)}
              style={{ cursor: "pointer", userSelect: "none" }}
            >
              <div style={{ display: "flex", alignItems: "center" }}>
                {FIELD_LABELS[field] || field}
                {renderSortIcon(field)}
              </div>
            </th>
          ))}
          <th>Действия</th>
        </tr>
      </thead>
      <tbody>
        {loading ? (
          <tr>
            <td colSpan={fields.length + 2} style={{ textAlign: "center" }}>
              Загрузка...
            </td>
          </tr>
        ) : data.length === 0 ? (
          <tr>
            <td colSpan={fields.length + 2} style={{ textAlign: "center" }}>
              Нет данных
            </td>
          </tr>
        ) : (
          data.map((item, index) => {
            const rowId = (currentPage - 1) * pageSize + index;
            return (
              <tr key={item.id}>
                <td style={{ whiteSpace: "nowrap", padding: "8px 12px", minWidth: 120 }}>
                  <strong>#{item.id}</strong>
                </td>
                {fields.map((field) => (
                  <td key={`${item.id}-${field}`} style={{ maxWidth: field === "description" ? 250 : field === "background_image" ? 160 : undefined }}>
                    <TableCell
                      value={item[field]}
                      fieldName={field}
                      rowId={rowId}
                      expandedDescriptions={expandedDescriptions}
                      onExpandToggle={onExpandDescription}
                    />
                  </td>
                ))}
                <td>
                  <div className={styles.table_actions}>
                    <button className={styles.edit_btn} onClick={() => onEdit(item)} title="Редактировать">
                      <MdModeEditOutline size={16} />
                    </button>
                    <button className={styles.delete_btn} onClick={() => onDelete(item)} title="Удалить">
                      <MdDeleteOutline size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })
        )}
      </tbody>
    </table>
  );
};
