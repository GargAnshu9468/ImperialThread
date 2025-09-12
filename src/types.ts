import { DrawerContentComponentProps } from "@react-navigation/drawer";

export type Category = 'All' | 'Shirts' | 'T-Shirts' | 'Polos' | 'Casual';

export type ProductVariant = {
    color: string;
    hex: string;
    images: string[];
    stockBySize: Record<string, number>;
};

export type Product = {
    id: string;
    name: string;
    price: number;
    description: string;
    sizes: string[];
    category: Category;
    variants: ProductVariant[];
};

export type CartItem = {
    id: string;
    name: string;
    price: number;
    variantIndex: number;
    selectedSize?: string;
    quantity: number;
    images: string[];
    color: string;
    hex: string;
    stockBySize: Record<string, number>;
};

export type OrderStatus = "Processing" | "Shipped" | "Out for delivery" | "Delivered" | "Cancelled";

export type OrderItem = {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: any;
};

export type Order = {
  id: string;
  date: string;
  status: OrderStatus;
  trackingId?: string;
  courier?: string;
  eta?: string;
  subtotal?: number;
  shipping?: number;
  tax?: number;
  total: number;
  address?: { name?: string; line1?: string; line2?: string; city?: string; zip?: string; phone?: string };
  items: OrderItem[];
};

export type PriceKey = "p0" | "p1" | "p2" | "p3";

export type ActiveFiltersRowProps = {
    category: Category;
    selectedPriceKeys: PriceKey[];
    selectedSizes: string[];
    onlyInStock: boolean;
    onClearChip: (type: "category" | "price" | "size" | "stock", value?: any) => void;
    onClearAll: () => void;
};

export type CategoriesAndToolbarProps = {
    categories: { label: Category; icon: string }[];
    category: Category;
    setCategory: (c: Category) => void;
    onSort: () => void;
    onFilter: () => void;
    gradient: string[];
};

export type HeroHeaderProps = {
    brand: string;
    query: string;
    onQuery: (q: string) => void;
    onMenu: () => void;
    right?: React.ReactNode;
};

export type SortFilterSheetProps = {
    visible: boolean;
    onClose: () => void;
    tab: "sort" | "filter";
    setTab: (t: "sort" | "filter") => void;

    sortKey: "rel" | "plh" | "phl" | "name";
    setSortKey: (k: "rel" | "plh" | "phl" | "name") => void;

    onlyInStock: boolean;
    setOnlyInStock: (v: boolean) => void;

    selectedPriceKeys: PriceKey[];
    setSelectedPriceKeys: React.Dispatch<React.SetStateAction<PriceKey[]>>;

    allSizes: string[];
    selectedSizes: string[];
    setSelectedSizes: React.Dispatch<React.SetStateAction<string[]>>;
};

export type CartIconBadgeProps = { color?: string; onPress?: () => void };

export type CustomDrawerContentProps = DrawerContentComponentProps & {
  onToggleTheme?: () => void;
  isDark?: boolean;
};

export type AuthContextShapeProps = {
  loading: boolean;
  isFirstLaunch: boolean | null;
  isLoggedIn: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  finishOnboarding: () => Promise<void>;
};

export type CartState = { items: CartItem[] };

export type CartAction =
  | { type: 'HYDRATE'; payload: CartItem[] }
  | { type: 'ADD'; payload: CartItem }
  | { type: 'REMOVE'; payload: { id: string; selectedSize?: string; variantIndex: number } }
  | { type: 'UPDATE_QTY'; payload: { id: string; selectedSize?: string; variantIndex: number; qty: number } }
  | { type: 'CLEAR' };

export type CartContextType = {
  items: CartItem[];
  add: (product: Product, qty?: number, size?: string, variantIndex?: number) => void;
  remove: (id: string, size?: string, variantIndex?: number) => void;
  updateQty: (id: string, qty: number, size?: string, variantIndex?: number) => void;
  clear: () => void;
};

export type Promo = {
  code: string;
  label: string;
  // return the discount amount for a given subtotal (in ₹)
  compute: (subtotal: number) => number;
};

export type ProductScreenParams = {
    product: any;
    similarProducts?: any[];
};

export type SavedAddress = {
    id: string;
    name: string;
    line: string;
    pin: string;
};
