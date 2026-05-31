import { apiFetch } from "./api";

export async function placeOrder(listingId: string, quantity: number) {
  return apiFetch<{ id: string; status: string; totalPrice: number }>("/orders", {
    method: "POST",
    body: JSON.stringify({ listingId, quantity })
  });
}
