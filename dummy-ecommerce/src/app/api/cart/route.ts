import { NextRequest } from "next/server";
import { cartRequest } from "@/lib/cart";

export const dynamic = "force-dynamic";
export const GET = (request: NextRequest) => cartRequest(request);
export const POST = (request: NextRequest) => cartRequest(request);
