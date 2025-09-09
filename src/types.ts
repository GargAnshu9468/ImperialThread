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
