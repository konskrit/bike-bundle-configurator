export type FrameType =
  "Touring" | "Road" | "Mountain" | "Urban" | "E-Cargo" | "E-Urban";

export type Bike = {
  id: string;
  name: string;
  frameType: FrameType;
  price: number;
  taxRate: number;
};

export type Accessory = {
  id: string;
  name: string;
  price: number;
  taxRate: number;
  compatibleFrameTypes: FrameType[];
  maxAmount: number;
};
