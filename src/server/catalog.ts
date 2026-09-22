import "server-only";

import accessoriesJson from "../../data/accessories.json";
import bikesJson from "../../data/bikes.json";
import type { Accessory, Bike } from "@/types";

export function getBikes(): Bike[] {
  return bikesJson as Bike[];
}

export function getAccessories(): Accessory[] {
  return accessoriesJson as Accessory[];
}
