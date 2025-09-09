import { Product } from '../types';

export const PRODUCTS: Product[] = [
    {
        id: 'shirt-oxford-001',
        name: 'Imperial Oxford Shirt',
        price: 1999,
        description: 'Classic oxford weave — slim modern fit. 100% premium cotton.',
        sizes: ['S', 'M', 'L', 'XL'],
        category: 'Shirts',
        variants: [
            {
                color: 'Navy Blue',
                hex: '#0F1724',
                images: [require("../../assets/img/products/product_1.jpeg")],
                stockBySize: { S: 10, M: 8, L: 6, XL: 4 },
            },
            {
                color: 'White',
                hex: '#FFFFFF',
                images: [require("../../assets/img/products/product_2.jpeg"),],
                stockBySize: { S: 5, M: 4, L: 2, XL: 0 },
            }
        ]
    },
    {
        id: 'tee-premium-003',
        name: 'Imperial Premium Tee',
        price: 1299,
        description: 'Ultra-soft crewneck tee for everyday comfort.',
        sizes: ['S', 'M', 'L', 'XL'],
        category: 'T-Shirts',
        variants: [
            {
                color: 'Black',
                hex: '#000000',
                images: [require("../../assets/img/products/product_2.jpeg"),],
                stockBySize: { S: 12, M: 12, L: 12, XL: 12 },
            },
            {
                color: 'Olive',
                hex: '#556B2F',
                images: [require("../../assets/img/products/product_1.jpeg"),],
                stockBySize: { S: 8, M: 6, L: 3, XL: 1 },
            }
        ]
    },
    {
        id: 'tee-oxford-003',
        name: 'Imperial Oxford Tee',
        price: 999,
        description: 'Ultra-soft crewneck tee for everyday comfort.',
        sizes: ['S', 'M', 'L', 'XL'],
        category: 'T-Shirts',
        variants: [
            {
                color: 'Black',
                hex: '#000000',
                images: [require("../../assets/img/products/product_1.jpeg"),],
                stockBySize: { S: 12, M: 12, L: 12, XL: 12 },
            },
            {
                color: 'Olive',
                hex: '#556B2F',
                images: [require("../../assets/img/products/product_2.jpeg"),],
                stockBySize: { S: 8, M: 6, L: 3, XL: 1 },
            }
        ]
    },
    {
        id: 'shirt-premium-001',
        name: 'Imperial Premium Shirt',
        price: 2999,
        description: 'Ultra-soft crewneck shirt for everyday comfort.',
        sizes: ['S', 'M', 'L', 'XL'],
        category: 'Shirts',
        variants: [
            {
                color: 'Black',
                hex: '#000000',
                images: [require("../../assets/img/products/product_2.jpeg"),],
                stockBySize: { S: 12, M: 12, L: 12, XL: 12 },
            },
            {
                color: 'Olive',
                hex: '#556B2F',
                images: [require("../../assets/img/products/product_1.jpeg"),],
                stockBySize: { S: 8, M: 6, L: 3, XL: 1 },
            }
        ]
    }
];
