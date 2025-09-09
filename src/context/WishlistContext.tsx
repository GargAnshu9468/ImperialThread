import React, { createContext, useState, useContext } from "react";

const WishlistContext = createContext<any>(null);

export const WishlistProvider = ({ children }: any) => {
    const [wishlist, setWishlist] = useState<any[]>([]);

    const addToWishlist = (product: any) => {
        setWishlist((prev) => {
            if (prev.find((p) => p.id === product.id)) return prev; // avoid duplicates
            return [...prev, product];
        });
    };

    const removeFromWishlist = (productId: string) => {
        setWishlist((prev) => prev.filter((p) => p.id !== productId));
    };

    return (
        <WishlistContext.Provider
            value={{ wishlist, addToWishlist, removeFromWishlist }}
        >
            {children}
        </WishlistContext.Provider>
    );
};

export const useWishlist = () => useContext(WishlistContext);
