export const statCardStyles = {
  container: {
    backgroundColor: "#1A1A1A",
    border: "1px solid #262626",
    borderRadius: "12px",
    padding: "20px",
    transition: "all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
    cursor: "default",
  } as React.CSSProperties,
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "12px",
  } as React.CSSProperties,
  icon: {
    fontSize: "28px",
    lineHeight: "1",
  } as React.CSSProperties,
  title: {
    fontSize: "12px",
    color: "#A1A1A1",
    fontWeight: 500,
  } as React.CSSProperties,
  value: {
    fontSize: "32px",
    fontWeight: 700,
    color: "#FFFFFF",
    lineHeight: 1.2,
  } as React.CSSProperties,
};

export const statsContainerStyles = {
  wrapper: {
    backgroundColor: "#1A1A1A",
    border: "1px solid #262626",
    borderRadius: "12px",
    padding: "24px",
  } as React.CSSProperties,
};
