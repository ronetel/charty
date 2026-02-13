export type TableName =
  | "products"
  | "categories"
  | "users"
  | "roles"
  | "orders"
  | "paymentMethods";

export interface FormData {
  [key: string]: string | number | boolean;
}

export interface PaginationData {
  count: number;
  page: number;
  page_size: number;
  total_pages: number;
  results: any[];
}

export interface TableState {
  active: TableName;
  data: any[];
  loading: boolean;
  isFormOpen: boolean;
  editingId: number | null;
  formData: FormData;
  successMessage: string;
  errorMessage: string;
  validationErrors: string[];
  expandedDescriptions: Record<number, boolean>;
  currentPage: number;
  pageSize: number;
  totalPages: number;
  totalCount: number;
  searchQuery: string;
  debouncedSearch: string;
  sortBy: string;
  sortOrder: "asc" | "desc";
}

export interface TableActions {
  handleSort: (field: string) => void;
  setActive: (table: TableName) => void;
  setCurrentPage: (page: number) => void;
  setPageSize: (size: number) => void;
  setSearchQuery: (query: string) => void;
  handleOpenAddForm: () => void;
  handleOpenEditForm: (item: any) => void;
  handleSubmitForm: (e: React.FormEvent) => Promise<void>;
  handleDelete: (id: number) => Promise<void>;
}
