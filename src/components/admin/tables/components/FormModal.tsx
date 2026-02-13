import React, { useState, useEffect } from "react";
import { MdClose } from "react-icons/md";
import { TableName, FormData } from "../types";
import { TABLE_FIELDS, FIELD_LABELS } from "../constants";
import { FormField } from "./FormField";
import { COLORS } from '@/theme';

interface FormModalProps {
  isOpen: boolean;
  title: string;
  activeTable: TableName;
  initialData?: FormData;
  isLoading: boolean;
  validationErrors: Record<string, string>;
  onClose: () => void;
  onSubmit: (data: FormData) => void;
}

export const FormModal: React.FC<FormModalProps> = ({
  isOpen,
  title,
  activeTable,
  initialData,
  isLoading,
  validationErrors,
  onClose,
  onSubmit,
}) => {
  const [formData, setFormData] = useState<FormData>({});

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      setFormData({});
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const fields = TABLE_FIELDS[activeTable];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleFieldChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: COLORS.modalOverlay || 'rgba(0,0,0,0.5)',
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: COLORS.dark,
          color: COLORS.white,
          borderRadius: 8,
          boxShadow: "0 20px 25px rgba(0, 0, 0, 0.6)",
          maxWidth: 500,
          width: "90%",
          maxHeight: "90vh",
          overflow: "auto",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "16px",
            borderBottom: `1px solid ${COLORS.darkSoft}`,
            position: "sticky",
            top: 0,
            backgroundColor: COLORS.dark,
          }}
        >
          <h2 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: COLORS.white }}>
            {title}
          </h2>
          <button
            onClick={onClose}
            disabled={isLoading}
            style={{
              background: "none",
              border: "none",
              cursor: isLoading ? "not-allowed" : "pointer",
              fontSize: 24,
              color: COLORS.gray,
              padding: "4px",
            }}
          >
            <MdClose />
          </button>
        </div>

        
        <form onSubmit={handleSubmit} style={{ padding: "16px" }}>
          {fields.map((field) => (
            <FormField
              key={field}
              fieldName={field}
              fieldValue={formData[field] ?? ""}
              fieldLabel={FIELD_LABELS[field] || field}
              activeTable={activeTable}
              error={validationErrors[field]}
              onChange={(value) => handleFieldChange(field, value)}
              disabled={isLoading}
              isLoading={isLoading}
            />
          ))}

          
          <div
            style={{
              display: "flex",
              gap: 8,
              marginTop: 20,
              paddingTop: 16,
              borderTop: `1px solid ${COLORS.darkSoft}`,
            }}
          >
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              style={{
                flex: 1,
                padding: "8px 16px",
                fontSize: 12,
                fontWeight: 600,
                border: `1px solid ${COLORS.darkSoft}`,
                borderRadius: 4,
                backgroundColor: COLORS.darkLight,
                color: COLORS.white,
                cursor: isLoading ? "not-allowed" : "pointer",
                opacity: isLoading ? 0.6 : 1,
              }}
            >
              Отмена
            </button>
            <button
              type="submit"
              disabled={isLoading}
              style={{
                flex: 1,
                padding: "8px 16px",
                fontSize: 12,
                fontWeight: 600,
                border: "none",
                borderRadius: 4,
                backgroundColor: isLoading ? COLORS.gray : COLORS.darkSoft,
                color: COLORS.white,
                cursor: isLoading ? "not-allowed" : "pointer",
              }}
            >
              {isLoading ? "Сохранение..." : "Сохранить"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
