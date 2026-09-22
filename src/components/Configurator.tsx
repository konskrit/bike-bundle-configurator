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
  const selectedBike = bikes.find((bike) => bike.id === selectedBikeId) ?? null;

  return (
    <>
      <BikePicker
        bikes={bikes}
        selectedBikeId={selectedBikeId}
        onSelect={setSelectedBikeId}
      />
      <AccessoryList
        accessories={accessories}
        frameType={selectedBike?.frameType ?? null}
      />
    </>
  );
}
