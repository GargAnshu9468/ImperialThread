import React, { createContext, useReducer, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CartItem, CartState, CartAction, CartContextType, Product, ProductVariant } from '../utils/types';

// clamp to stock safely
function clampQty(variant: ProductVariant, selectedSize: string | undefined, desired: number) {
  if (!selectedSize) return Math.max(1, desired);
  const max = variant.stockBySize?.[selectedSize] ?? 0;
  return Math.min(Math.max(1, desired), max);
}

const initialState: CartState = { items: [] };

function sameLine(a: CartItem, b: CartItem) {
  return a.id === b.id && a.selectedSize === b.selectedSize && a.variantIndex === b.variantIndex;
}

function reducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'HYDRATE':
      return { items: action.payload };
    case 'ADD': {
      const found = state.items.find(i => sameLine(i, action.payload));
      if (found) {
        const variant: ProductVariant = {
          color: found.color,
          hex: found.hex,
          images: found.images,
          stockBySize: found.stockBySize,
        };
        const newQty = clampQty(variant, action.payload.selectedSize, found.quantity + action.payload.quantity);
        return {
          items: state.items.map(i =>
            sameLine(i, action.payload) ? { ...i, quantity: newQty } : i
          ),
        };
      }
      return { items: [...state.items, action.payload] };
    }
    case 'REMOVE':
      return {
        items: state.items.filter(
          i =>
            !(
              i.id === action.payload.id &&
              i.selectedSize === action.payload.selectedSize &&
              i.variantIndex === action.payload.variantIndex
            )
        ),
      };
    case 'UPDATE_QTY':
      return {
        items: state.items.map(i => {
          if (
            i.id === action.payload.id &&
            i.selectedSize === action.payload.selectedSize &&
            i.variantIndex === action.payload.variantIndex
          ) {
            const variant: ProductVariant = {
              color: i.color,
              hex: i.hex,
              images: i.images,
              stockBySize: i.stockBySize,
            };
            const qty = clampQty(variant, i.selectedSize, action.payload.qty);
            return { ...i, quantity: qty };
          }
          return i;
        }),
      };
    case 'CLEAR':
      return { items: [] };
    default:
      return state;
  }
}

// safer default
const CartContext = createContext<CartContextType>({
  items: [],
  add: () => {},
  remove: () => {},
  updateQty: () => {},
  clear: () => {},
});

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  // hydrate
  useEffect(() => {
    (async () => {
      const raw = await AsyncStorage.getItem('cart');
      if (raw) dispatch({ type: 'HYDRATE', payload: JSON.parse(raw) });
    })();
  }, []);

  // persist
  useEffect(() => {
    AsyncStorage.setItem('cart', JSON.stringify(state.items));
  }, [state.items]);

  const add = (product: Product, quantity = 1, selectedSize?: string, variantIndex = 0) => {
    const variant = product.variants[variantIndex];
    const qty = clampQty(variant, selectedSize, quantity);
    const item: CartItem = {
      id: product.id,
      name: product.name,
      price: product.price,
      variantIndex,
      selectedSize,
      quantity: qty,
      images: variant.images,
      color: variant.color,
      hex: variant.hex,
      stockBySize: variant.stockBySize,
    };
    dispatch({ type: 'ADD', payload: item });
  };

  const remove = (id: string, selectedSize?: string, variantIndex = 0) =>
    dispatch({ type: 'REMOVE', payload: { id, selectedSize, variantIndex } });

  const updateQty = (id: string, qty: number, selectedSize?: string, variantIndex = 0) =>
    dispatch({ type: 'UPDATE_QTY', payload: { id, qty, selectedSize, variantIndex } });

  const clear = () => dispatch({ type: 'CLEAR' });

  return (
    <CartContext.Provider value={{ items: state.items, add, remove, updateQty, clear }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
