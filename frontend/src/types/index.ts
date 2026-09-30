export const CATEGORIES = [
    "dairy",
    "produce",
    "meat",
    "leftovers",
    "drinks",
    "other",
  ] as const;
  
  export type Category = (typeof CATEGORIES)[number];
  export type ItemState = "active" | "used" | "tossed";
  export type Freshness = "fresh" | "expiring" | "expired";
  export type StatusFilter = "all" | Freshness;
  export type Tone = "ok" | "warn" | "danger";
  
  export type FieldName =
    | "name"
    | "owner"
    | "category"
    | "quantity"
    | "expires_on"
    | "body"
    | "state";
  
  export type FieldErrors = Partial<Record<FieldName, string>>;
  
  /** Row as stored, plus the fields the API computes on the way out. */
  export type Item = {
    id: string;
    name: string;
    owner: string;
    category: string;
    quantity: number;
    added_on: string;
    expires_on: string;
    state: ItemState;
    days_left: number;
    status: Freshness;
  };
  
  /** What the add form collects. Quantity stays a string until validation. */
  export type ItemDraft = {
    name: string;
    owner: string;
    category: string;
    quantity: string;
    expires_on: string;
  };
  
  export type Stats = {
    total_active: number;
    expiring_soon: number;
    expired: number;
    used: number;
    tossed: number;
    waste_rate: number;
  };
  
  export type ItemRow = {
    id: string;
    name: string;
    ownerLabel: string;
    categoryLabel: string;
    badgeLabel: string;
    tone: Tone;
  };
  
  export type StatsCards = {
    active: string;
    expiringSoon: string;
    expired: string;
    wasteRate: string;
  };
  
  export type FilterValue = {
    status: StatusFilter;
    owner: string;
  };
  
  export type StatsBarProps = {
    stats: StatsCards | null;
    isLoading: boolean;
  };
  
  export type FilterBarProps = {
    value: FilterValue;
    owners: string[];
    onChange: (value: FilterValue) => void;
  };
  
  export type ItemTableProps = {
    rows: ItemRow[];
    isLoading: boolean;
    error: string | null;
    onMarkUsed: (id: string) => void;
    onMarkTossed: (id: string) => void;
  };
  
  export type AddItemFormProps = {
    categories: readonly string[];
    fieldErrors: FieldErrors;
    isSubmitting: boolean;
    onSubmit: (draft: ItemDraft) => void;
  };
  
  export type RefreshControlProps = {
    isRefreshing: boolean;
    lastUpdatedLabel: string;
    onRefresh: () => void;
  };