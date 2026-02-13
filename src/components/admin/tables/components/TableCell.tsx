import React from "react";
import { formatCellValue } from "../utils";

interface TableCellProps {
  value: any;
  fieldName: string;
  rowId: number;
  expandedDescriptions: Record<number, boolean>;
  onExpandToggle: (rowId: number) => void;
}

export const TableCell: React.FC<TableCellProps> = ({
  value,
  fieldName,
  rowId,
  expandedDescriptions,
  onExpandToggle,
}) => {
  // Обработка описания с expand/collapse
  if (fieldName === "description") {
    const str = String(value || "");
    const isExpanded = expandedDescriptions[rowId] || false;
    const short = str.length > 180 ? str.slice(0, 180) + "..." : str;

    return (
      <div style={{ position: "relative", maxWidth: "200px" }}>
        <div
          style={{
            whiteSpace: "pre-line",
            wordBreak: "break-word",
            overflowWrap: "anywhere",
            maxHeight: isExpanded ? undefined : 48,
            overflow: isExpanded ? "auto" : "hidden",
            display: "-webkit-box",
            WebkitLineClamp: isExpanded ? undefined : 2,
            WebkitBoxOrient: "vertical",
          }}
        >
          {isExpanded ? str : short}
        </div>
        {str.length > 180 && (
          <button
            type="button"
            onClick={() => onExpandToggle(rowId)}
            style={{
              background: "none",
              border: "none",
              color: "#83B4FF",
              cursor: "pointer",
              fontSize: 12,
              padding: 0,
              marginTop: 2,
            }}
          >
            {isExpanded ? "Скрыть" : "Показать полностью"}
          </button>
        )}
      </div>
    );
  }

  // Обработка background_image с ссылкой
  if (fieldName === "background_image") {
    return value ? (
      <a
        href={value}
        target="_blank"
        rel="noopener noreferrer"
        style={{ color: "#83B4FF", wordBreak: "break-all" }}
      >
        {value}
      </a>
    ) : (
      "—"
    );
  }

  // Остальное форматируем классическим способом
  return formatCellValue(value, fieldName);
};
