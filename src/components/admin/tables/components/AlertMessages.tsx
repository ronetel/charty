import React from "react";
import styles from "@/styles/admin.module.scss";

interface AlertMessagesProps {
  errorMessage: string;
  successMessage: string;
  validationErrors: string[];
}

export const AlertMessages: React.FC<AlertMessagesProps> = ({
  errorMessage,
  successMessage,
  validationErrors,
}) => {
  return (
    <>
      {errorMessage && (
        <div className={styles.error_message}>{errorMessage}</div>
      )}

      {validationErrors.length > 0 && (
        <div className={styles.error_message} style={{ marginBottom: 8 }}>
          <ul style={{ paddingLeft: 18 }}>
            {validationErrors.map((err, idx) => (
              <li key={idx}>{err}</li>
            ))}
          </ul>
        </div>
      )}

      {successMessage && (
        <div className={styles.success_message}>{successMessage}</div>
      )}
    </>
  );
};
