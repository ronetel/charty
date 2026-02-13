import React from "react";

interface TablePaginationProps {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  loading: boolean;
  hasData: boolean;
  onPageChange: (page: number) => void;
}

export const TablePagination: React.FC<TablePaginationProps> = ({
  currentPage,
  totalPages,
  totalCount,
  loading,
  hasData,
  onPageChange,
}) => {
  if (loading || !hasData) return null;

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "12px 0",
        borderBottom: "1px solid #262626",
        marginBottom: "16px",
        flexWrap: "wrap",
        gap: "12px",
      }}
    >
      <div style={{ fontSize: "12px", color: "#A1A1A1" }}>
        Записей: {totalCount} | Страница: {currentPage} из {totalPages}
      </div>
      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
        <button
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          style={{
            padding: "8px 12px",
            backgroundColor: currentPage === 1 ? "#1A1A1A" : "#2A2A2A",
            border: "1px solid #262626",
            borderRadius: "6px",
            color: currentPage === 1 ? "#666666" : "#FFFFFF",
            cursor: currentPage === 1 ? "not-allowed" : "pointer",
            fontSize: "12px",
          }}
        >
          Предыдущая
        </button>

        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            style={{
              padding: "8px 12px",
              backgroundColor: page === currentPage ? "#83B4FF" : "#2A2A2A",
              border: "1px solid #262626",
              borderRadius: "6px",
              color: page === currentPage ? "#000000" : "#FFFFFF",
              cursor: "pointer",
              fontSize: "12px",
              fontWeight: page === currentPage ? "600" : "400",
            }}
          >
            {page}
          </button>
        ))}

        <button
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          style={{
            padding: "8px 12px",
            backgroundColor: currentPage === totalPages ? "#1A1A1A" : "#2A2A2A",
            border: "1px solid #262626",
            borderRadius: "6px",
            color: currentPage === totalPages ? "#666666" : "#FFFFFF",
            cursor: currentPage === totalPages ? "not-allowed" : "pointer",
            fontSize: "12px",
          }}
        >
          Следующая
        </button>
      </div>
    </div>
  );
};
