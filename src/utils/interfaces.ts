import type { Product } from "./types";

export interface VariantSwatchProps {
  color: string;
  hex: string;
  selected?: boolean;
  onPress?: () => void;
}

export interface RecommendedCarouselProps {
    title: string;
    products: Product[];
    onPressSeeAll: () => void;
    onPressProduct: (product: Product) => void;
    accentColor?: string;
}
