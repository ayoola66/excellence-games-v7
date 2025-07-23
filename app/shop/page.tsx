"use client";

import { useTheme } from "@/lib/theme-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Image from "next/image";

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  image: string;
  inStock: boolean;
}

const demoProducts: Product[] = [
  {
    id: 1,
    name: "Excellence UK Edition",
    description: "The classic board game that builds character and connection",
    price: 49.99,
    image: "/images/Excellence-Games-Logo-Black.png",
    inStock: true,
  },
  {
    id: 2,
    name: "Excellence Black Edition",
    description: "Premium version with exclusive content and materials",
    price: 79.99,
    image: "/images/Excellence-Games-Logo-Gold.png",
    inStock: true,
  },
  {
    id: 3,
    name: "Targeted",
    description: "Fast-paced game of strategy and social dynamics",
    price: 39.99,
    image: "/images/Targeted-logo.png",
    inStock: false,
  },
];

export default function ShopPage() {
  const { theme } = useTheme();

  return (
    <div>
      <div className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-foreground mb-4">
              Our Games
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Discover our collection of engaging games designed to challenge
              and inspire
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {demoProducts.map((product) => (
            <Card key={product.id}>
              <div className="relative aspect-square">
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  className="object-contain p-8"
                />
                {!product.inStock && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <span className="text-white font-semibold text-lg">
                      Coming Soon
                    </span>
                  </div>
                )}
              </div>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xl font-semibold text-foreground">
                    {product.name}
                  </h3>
                  <span className="text-lg font-semibold text-foreground">
                    £{product.price}
                  </span>
                </div>
                <p className="text-muted-foreground mb-4">
                  {product.description}
                </p>
                <Button
                  className="w-full"
                  variant={product.inStock ? "default" : "secondary"}
                  disabled={!product.inStock}
                >
                  {product.inStock ? "Add to Cart" : "Out of Stock"}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
