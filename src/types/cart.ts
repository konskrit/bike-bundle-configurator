import type { Accessory, Bike } from "@/types/catalog";

export type CartAccessoryLine = {
  accessory: Accessory;
  quantity: number;
};

export type CartBundle = {
  id: string;
  bike: Bike;
  accessories: CartAccessoryLine[];
  net: number;
  gross: number;
};
