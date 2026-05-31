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
  farmerId: string;
  farmer: UserProfile;
}

export async function fetchListings() {
  return apiFetch<ListingItem[]>("/listings");
}

export async function fetchMyListings() {
  return apiFetch<ListingItem[]>("/listings/mine");
}

export async function createListing(data: {
  title: string;
  description?: string;
  price: number;
  quantity: number;
  region: string;
  image?: string;
}) {
  return apiFetch<ListingItem>("/listings", {
    method: "POST",
    body: JSON.stringify(data)
  });
}

export async function deleteListing(listingId: string) {
  return apiFetch<{ message: string }>(`/listings/${listingId}`, {
    method: "DELETE"
  });
}
