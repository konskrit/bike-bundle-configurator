import "server-only";

import accessoriesJson from "../../data/accessories.json";
import bikesJson from "../../data/bikes.json";
import type { Accessory, Bike, FrameType } from "@/types/catalog";

export function getBikes(): Bike[] {
  return bikesJson as Bike[];
}

export function getBike(id: string): Bike | undefined {
  return getBikes().find((bike) => bike.id === id);
}

export function getAccessories(): Accessory[] {
  return accessoriesJson as Accessory[];
}

export function getAccessoriesForFrame(frameType: FrameType): Accessory[] {
  return getAccessories().filter((accessory) =>
    accessory.compatibleFrameTypes.includes(frameType),
  );
}
