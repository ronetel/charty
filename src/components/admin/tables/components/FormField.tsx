import React from "react";
import { isDateField, isNumberField, isBooleanField, isTextareaField } from "../utils";
import { TableName } from "../types";
import { COLORS } from '@/theme';

interface FormFieldProps {
  fieldName: string;
  fieldValue: any;
  fieldLabel: string;
  activeTable: TableName;
  error?: string;
  onChange: (value: any) => void;
  onBlur?: () => void;
  disabled?: boolean;
  isLoading?: boolean;
}

export const FormField: React.FC<FormFieldProps> = ({
  fieldName,
  fieldValue,
  fieldLabel,
  activeTable,
  error,
  onChange,
  onBlur,
  disabled = false,
  isLoading = false,
}) => {
  const styles = {
    formGroup: {
      marginBottom: 12,
    },
    label: {
      display: "block",
      fontSize: 12,
      fontWeight: 600 as const,
      marginBottom: 4,
      color: COLORS.gray,
    },
    input: {
      width: "100%",
      padding: "8px 12px",
      fontSize: 12,
      border: error ? `1px solid #EF4444` : `1px solid ${COLORS.darkSoft}`,
      backgroundColor: disabled ? COLORS.darkLight : COLORS.darkLight,
      color: COLORS.white,
      borderRadius: 4,
      fontFamily: "inherit",
      cursor: disabled ? "not-allowed" : "auto",
    },
    error: {
      color: "#EF4444",
      fontSize: 11,
      marginTop: 4,
    },
  };

  if (isBooleanField(fieldName, activeTable)) {
    return (
      <div style={styles.formGroup}>
        <label style={styles.label}>{fieldLabel}</label>
        <input
          type="checkbox"
          checked={fieldValue || false}
          onChange={(e) => onChange(e.target.checked)}
          onBlur={onBlur}
          disabled={disabled || isLoading}
          style={{ cursor: disabled || isLoading ? "not-allowed" : "pointer" }}
        />
        {error && <div style={styles.error}>{error}</div>}
      </div>
    );
  }

  if (isTextareaField(fieldName)) {
    return (
      <div style={styles.formGroup}>
        <label style={styles.label}>{fieldLabel}</label>
        <textarea
          value={fieldValue || ""}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          disabled={disabled || isLoading}
          style={{
            ...styles.input,
            resize: "vertical",
            minHeight: 80,
          } as React.CSSProperties}
        />
        {error && <div style={styles.error}>{error}</div>}
      </div>
    );
  }

  if (isDateField(fieldName)) {
    return (
      <div style={styles.formGroup}>
        <label style={styles.label}>{fieldLabel}</label>
        <input
          type="date"
          value={fieldValue || ""}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          disabled={disabled || isLoading}
          style={styles.input}
        />
        {error && <div style={styles.error}>{error}</div>}
      </div>
    );
  }

  if (isNumberField(fieldName)) {
    return (
      <div style={styles.formGroup}>
        <label style={styles.label}>{fieldLabel}</label>
        <input
          type="number"
          value={fieldValue ?? ""}
          onChange={(e) => onChange(e.target.value === "" ? null : Number(e.target.value))}
          onBlur={onBlur}
          disabled={disabled || isLoading}
          style={styles.input}
        />
        {error && <div style={styles.error}>{error}</div>}
      </div>
    );
  }

  // Default text input
  return (
    <div style={styles.formGroup}>
      <label style={styles.label}>{fieldLabel}</label>
      <input
        type="text"
        value={fieldValue || ""}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        disabled={disabled || isLoading}
        style={styles.input}
      />
      {error && <div style={styles.error}>{error}</div>}
    </div>
  );
};
