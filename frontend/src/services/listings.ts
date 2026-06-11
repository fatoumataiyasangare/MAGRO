import { apiFetch } from "./api";
import type { UserProfile } from "./auth";

export interface ListingItem {
  id: string;
  title: string;
  description: string;
  price: number;
  quantity: number;
  region: string;
  image: string;
  videoUrl?: string | null;
  farmerId: string;
  farmer: UserProfile;
}

export async function fetchListings() {
  return await apiFetch<ListingItem[]>("/listings");
}

export async function fetchMyListings() {
  return await apiFetch<ListingItem[]>("/listings/mine");
}

export async function createListing(data: {
  title: string;
  description?: string;
  price: number;
  quantity: number;
  region: string;
  image?: string;
  videoUrl?: string | null;
}) {
  return await apiFetch<ListingItem>("/listings", {
    method: "POST",
    body: JSON.stringify(data)
  });
}

export async function deleteListing(listingId: string) {
  return await apiFetch<{ message: string }>(`/listings/${listingId}`, {
    method: "DELETE"
  });
}

export async function updateListingQuantity(listingId: string, quantityToSubtract: number) {
  await apiFetch(`/listings/${listingId}/stock`, {
    method: "PATCH",
    body: JSON.stringify({ decrementBy: quantityToSubtract })
  });
}

export async function updateListing(listingId: string, updates: { price?: number; quantity?: number; image?: string }) {
  return await apiFetch<ListingItem>(`/listings/${listingId}`, {
    method: "PATCH",
    body: JSON.stringify(updates)
  });
}
