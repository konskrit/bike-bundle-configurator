"use client";

import { useState } from "react";
import { AccessoryList } from "@/components/AccessoryList";
import { BikePicker } from "@/components/BikePicker";
import type { Accessory, Bike } from "@/types/catalog";

type Props = {
  bikes: Bike[];
  accessories: Accessory[];
};

export function Configurator({ bikes, accessories }: Props) {
  const [selectedBikeId, setSelectedBikeId] = useState<string | null>(null);
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const selectedBike = bikes.find((bike) => bike.id === selectedBikeId) ?? null;

  function handleSelectBike(bikeId: string) {
    setSelectedBikeId(bikeId);
    setQuantities({});
  }

  function handleQuantityChange(accessoryId: string, quantity: number) {
    setQuantities((current) => ({ ...current, [accessoryId]: quantity }));
  }

  return (
    <>
      <BikePicker
        bikes={bikes}
        selectedBikeId={selectedBikeId}
        onSelect={handleSelectBike}
      />
      <AccessoryList
        accessories={accessories}
        frameType={selectedBike?.frameType ?? null}
        quantities={quantities}
        onQuantityChange={handleQuantityChange}
      />
    </>
  );
}
