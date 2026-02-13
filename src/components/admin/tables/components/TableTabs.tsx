import React from "react";
import { TABLES, TABLE_LABELS } from "../constants";
import type { TableName } from "../types";
import styles from "@/styles/admin.module.scss";

interface TableTabsProps {
  active: TableName;
  onTabChange: (table: TableName) => void;
}

export const TableTabs: React.FC<TableTabsProps> = ({ active, onTabChange }) => {
  return (
    <div className={styles.table_tabs}>
      {TABLES.map((tableName) => (
        <button
          key={tableName}
          onClick={() => onTabChange(tableName)}
          className={`${styles.table_tab} ${active === tableName ? styles.active : ""}`}
        >
          {TABLE_LABELS[tableName]}
        </button>
      ))}
    </div>
  );
};
