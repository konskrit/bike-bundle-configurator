import {
  StockServiceError,
  reserveStock,
  withStockLatency,
} from "@/server/stock";

type StockItem = {
  id: string;
  quantity: number;
};

function isStockItem(value: unknown): value is StockItem {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const item = value as Record<string, unknown>;
  return (
    typeof item.id === "string" &&
    typeof item.quantity === "number" &&
    Number.isInteger(item.quantity) &&
    item.quantity >= 1
  );
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "INVALID_JSON" }, { status: 400 });
  }

  if (
    typeof body !== "object" ||
    body === null ||
    !Array.isArray((body as { items?: unknown }).items)
  ) {
    return Response.json({ error: "INVALID_BODY" }, { status: 400 });
  }

  const items = (body as { items: unknown[] }).items;
  if (!items.every(isStockItem)) {
    return Response.json({ error: "INVALID_BODY" }, { status: 400 });
  }

  try {
    const reserved = await withStockLatency(() => reserveStock(items));

    if (!reserved.ok) {
      return Response.json(
        { error: "INSUFFICIENT_STOCK", items: reserved.items },
        { status: 409 },
      );
    }

    return Response.json({ items: reserved.items });
  } catch (error) {
    if (error instanceof StockServiceError) {
      return Response.json({ error: "STOCK_SERVICE_FAILED" }, { status: 503 });
    }

    throw error;
  }
}
