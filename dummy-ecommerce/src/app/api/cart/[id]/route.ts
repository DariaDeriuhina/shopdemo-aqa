import { NextRequest } from "next/server";
import { cartRequest } from "@/lib/cart";

type Context = { params: Promise<{ id: string }> };
export async function PATCH(request: NextRequest, context: Context) {
  return cartRequest(request, (await context.params).id);
}
export async function DELETE(request: NextRequest, context: Context) {
  return cartRequest(request, (await context.params).id);
}
