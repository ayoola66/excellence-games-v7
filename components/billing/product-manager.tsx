import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import adminApiClient from "@/lib/admin-api-client";

interface Product {
  id: number;
  name: string;
  description: string;
  active: boolean;
  type: "one_time" | "subscription";
  prices: Price[];
}

interface Price {
  id: number;
  nickname: string;
  unitAmount: number;
  currency: string;
  type: "one_time" | "recurring";
  interval?: "day" | "week" | "month" | "year";
  intervalCount?: number;
  active: boolean;
}

export function ProductManager() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [newProduct, setNewProduct] = useState({
    name: "",
    description: "",
    type: "subscription" as const,
  });
  const [newPrice, setNewPrice] = useState({
    nickname: "",
    unitAmount: 0,
    currency: "GBP",
    type: "recurring" as const,
    interval: "month" as const,
    intervalCount: 1,
  });

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const response = await adminApiClient.getProducts();
      setProducts(response.data);
    } catch (error) {
      console.error("Error loading products:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProduct = async () => {
    try {
      await adminApiClient.createProduct(newProduct);
      await loadProducts();
      setNewProduct({ name: "", description: "", type: "subscription" });
    } catch (error) {
      console.error("Error creating product:", error);
    }
  };

  const handleUpdateProduct = async (id: number, data: Partial<Product>) => {
    try {
      await adminApiClient.updateProduct(id, data);
      await loadProducts();
    } catch (error) {
      console.error("Error updating product:", error);
    }
  };

  const handleCreatePrice = async (productId: number) => {
    try {
      await adminApiClient.createPrice({
        ...newPrice,
        product: productId,
        unitAmount: newPrice.unitAmount * 100, // Convert to cents
      });
      await loadProducts();
      setNewPrice({
        nickname: "",
        unitAmount: 0,
        currency: "GBP",
        type: "recurring",
        interval: "month",
        intervalCount: 1,
      });
    } catch (error) {
      console.error("Error creating price:", error);
    }
  };

  const handleUpdatePrice = async (id: number, data: Partial<Price>) => {
    try {
      await adminApiClient.updatePrice(id, data);
      await loadProducts();
    } catch (error) {
      console.error("Error updating price:", error);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Tabs defaultValue="products">
      <TabsList>
        <TabsTrigger value="products">Products</TabsTrigger>
        <TabsTrigger value="prices">Prices</TabsTrigger>
      </TabsList>

      <TabsContent value="products">
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Create New Product</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={newProduct.name}
                    onChange={(e) =>
                      setNewProduct({ ...newProduct, name: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    value={newProduct.description}
                    onChange={(e) =>
                      setNewProduct({
                        ...newProduct,
                        description: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="type">Type</Label>
                  <Select
                    value={newProduct.type}
                    onValueChange={(value: "one_time" | "subscription") =>
                      setNewProduct({ ...newProduct, type: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="one_time">One-time</SelectItem>
                      <SelectItem value="subscription">Subscription</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={handleCreateProduct}>Create Product</Button>
              </div>
            </CardContent>
          </Card>

          {products.map((product) => (
            <Card key={product.id}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{product.name}</span>
                  <Switch
                    checked={product.active}
                    onCheckedChange={(checked) =>
                      handleUpdateProduct(product.id, { active: checked })
                    }
                  />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p>{product.description}</p>
                <p>Type: {product.type}</p>
                <Button
                  variant="outline"
                  onClick={() => setSelectedProduct(product)}
                >
                  Manage Prices
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </TabsContent>

      <TabsContent value="prices">
        {selectedProduct && (
          <Card>
            <CardHeader>
              <CardTitle>Prices for {selectedProduct.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="nickname">Display Name</Label>
                  <Input
                    id="nickname"
                    value={newPrice.nickname}
                    onChange={(e) =>
                      setNewPrice({ ...newPrice, nickname: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="amount">Amount ({newPrice.currency})</Label>
                  <Input
                    id="amount"
                    type="number"
                    min="0"
                    step="0.01"
                    value={newPrice.unitAmount}
                    onChange={(e) =>
                      setNewPrice({
                        ...newPrice,
                        unitAmount: parseFloat(e.target.value),
                      })
                    }
                  />
                </div>
                {newPrice.type === "recurring" && (
                  <>
                    <div>
                      <Label htmlFor="interval">Billing Interval</Label>
                      <Select
                        value={newPrice.interval}
                        onValueChange={(
                          value: "day" | "week" | "month" | "year"
                        ) => setNewPrice({ ...newPrice, interval: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select interval" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="day">Daily</SelectItem>
                          <SelectItem value="week">Weekly</SelectItem>
                          <SelectItem value="month">Monthly</SelectItem>
                          <SelectItem value="year">Yearly</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="intervalCount">Interval Count</Label>
                      <Input
                        id="intervalCount"
                        type="number"
                        min="1"
                        value={newPrice.intervalCount}
                        onChange={(e) =>
                          setNewPrice({
                            ...newPrice,
                            intervalCount: parseInt(e.target.value, 10),
                          })
                        }
                      />
                    </div>
                  </>
                )}
                <Button onClick={() => handleCreatePrice(selectedProduct.id)}>
                  Add Price
                </Button>
              </div>

              <div className="mt-8 space-y-4">
                <h3 className="text-lg font-semibold">Existing Prices</h3>
                {selectedProduct.prices.map((price) => (
                  <Card key={price.id}>
                    <CardContent className="flex items-center justify-between p-4">
                      <div>
                        <p className="font-medium">{price.nickname}</p>
                        <p>
                          {(price.unitAmount / 100).toLocaleString("en-GB", {
                            style: "currency",
                            currency: price.currency,
                          })}
                          {price.type === "recurring" &&
                            ` / ${price.intervalCount} ${price.interval}${
                              price.intervalCount > 1 ? "s" : ""
                            }`}
                        </p>
                      </div>
                      <Switch
                        checked={price.active}
                        onCheckedChange={(checked) =>
                          handleUpdatePrice(price.id, { active: checked })
                        }
                      />
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </TabsContent>
    </Tabs>
  );
}
