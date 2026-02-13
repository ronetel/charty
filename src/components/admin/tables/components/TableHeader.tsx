import React from "react";
import { MdAdd } from "react-icons/md";
import { TABLE_LABELS } from "../constants";
import type { TableName } from "../types";
import styles from "@/styles/admin.module.scss";

interface TableHeaderProps {
  activeTable: TableName;
  searchQuery: string;
  pageSize: number;
  onSearchChange: (query: string) => void;
  onPageSizeChange: (size: number) => void;
  onAddClick: () => void;
}

export const TableHeader: React.FC<TableHeaderProps> = ({
  activeTable,
  searchQuery,
  pageSize,
  onSearchChange,
  onPageSizeChange,
  onAddClick,
}) => {
  return (
    <div className={styles.table_header}>
      <h3>{TABLE_LABELS[activeTable]}</h3>
      <div style={{ display: "flex", gap: "12px", marginLeft: "auto", alignItems: "center" }}>
        <input
          type="text"
          placeholder="Поиск..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          style={{
            padding: "8px 12px",
            backgroundColor: "#2A2A2A",
            border: "1px solid #262626",
            borderRadius: "6px",
            color: "#FFFFFF",
            fontSize: "14px",
            minWidth: "200px",
          }}
        />
        <button
          className={styles.submit_btn}
          onClick={onAddClick}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            width: "auto",
            padding: "10px 16px",
            borderRadius: "6px",
          }}
        >
          <MdAdd size={20} />
          Добавить
        </button>
        <select
          value={pageSize}
          onChange={(e) => onPageSizeChange(Number(e.target.value))}
          style={{
            backgroundColor: "#2A2A2A",
            border: "1px solid #262626",
            color: "#FFFFFF",
            padding: "8px 10px",
            borderRadius: "6px",
            fontSize: "14px",
          }}
          title="Элементов на странице"
        >
          <option value={15}>15 / стр.</option>
          <option value={30}>30 / стр.</option>
        </select>
      </div>
    </div>
  );
};
