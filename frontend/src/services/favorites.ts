import { apiFetch } from "./api";
import type { ListingItem } from "./listings";

export async function fetchFavorites(): Promise<ListingItem[]> {
  return await apiFetch<ListingItem[]>("/favorites");
}

export async function addFavorite(listingId: string): Promise<void> {
  await apiFetch("/favorites", {
    method: "POST",
    body: JSON.stringify({ listingId })
  });
}

export async function removeFavorite(listingId: string): Promise<void> {
  await apiFetch(`/favorites/${listingId}`, {
    method: "DELETE"
  });
}
