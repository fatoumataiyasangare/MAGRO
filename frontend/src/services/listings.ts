import { apiFetch } from "./api";
import type { UserProfile } from "./auth";
import { fetchWithFallback, getConfig } from "./config";

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

const LOCAL_STORAGE_KEY_LISTINGS = "magro_mock_listings";

function getMockListings(): ListingItem[] {
  const data = localStorage.getItem(LOCAL_STORAGE_KEY_LISTINGS);
  if (!data) {
    const initial: ListingItem[] = [
      {
        id: "1",
        title: "Tomates fraîches",
        description: "Tomates cultivées de manière écologique",
        price: 750,
        quantity: 500,
        region: "Sikasso",
        image: "https://images.unsplash.com/photo-1758487405872-8e179dfe703e?w=400",
        farmerId: "farmer-1",
        farmer: { id: "farmer-1", phone: "+22370123456", name: "Amadou Traoré", role: "FARMER" }
      },
      {
        id: "2",
        title: "Oignons blancs",
        description: "Oignons de qualité supérieure",
        price: 500,
        quantity: 800,
        region: "Kayes",
        image: "https://images.unsplash.com/photo-1534383346555-6cff1eaca960?w=400",
        farmerId: "mock-farmer",
        farmer: { id: "mock-farmer", phone: "+22370234567", name: "Fatoumata Keita", role: "FARMER" }
      },
      {
        id: "3",
        title: "Mangues Kent",
        description: "Mangues douces et juteuses",
        price: 1200,
        quantity: 300,
        region: "Koulikoro",
        image: "https://images.unsplash.com/photo-1772984613890-e3bfbca7f245?w=400",
        farmerId: "farmer-3",
        farmer: { id: "farmer-3", phone: "+22370345678", name: "Ibrahim Coulibaly", role: "FARMER" }
      }
    ];
    localStorage.setItem(LOCAL_STORAGE_KEY_LISTINGS, JSON.stringify(initial));
    return initial;
  }
  return JSON.parse(data);
}

function saveMockListings(listings: ListingItem[]) {
  localStorage.setItem(LOCAL_STORAGE_KEY_LISTINGS, JSON.stringify(listings));
}

export async function fetchListings() {
  const cfg = getConfig();
  
  if (!cfg.isApiAvailable || cfg.mockDataEnabled) {
    return getMockListings();
  }
  
  try {
    return await apiFetch<ListingItem[]>("/listings");
  } catch (err) {
    return getMockListings();
  }
}

export async function fetchMyListings() {
  const cfg = getConfig();
  
  if (!cfg.isApiAvailable || cfg.mockDataEnabled) {
    return getMockListings().filter(l => l.farmerId === "mock-farmer");
  }
  
  try {
    return await apiFetch<ListingItem[]>("/listings/mine");
  } catch (err) {
    return getMockListings().filter(l => l.farmerId === "mock-farmer");
  }
}

export async function createListing(data: {
  title: string;
  description?: string;
  price: number;
  quantity: number;
  region: string;
  image?: string;
}) {
  const cfg = getConfig();
  
  if (!cfg.isApiAvailable || cfg.mockDataEnabled) {
    const listings = getMockListings();
    const newListing: ListingItem = {
      id: "mock-" + Date.now(),
      title: data.title,
      description: data.description || "",
      price: data.price,
      quantity: data.quantity,
      region: data.region,
      image: data.image || "https://images.unsplash.com/photo-1772984613890-e3bfbca7f245?w=400",
      farmerId: "mock-farmer",
      farmer: { id: "mock-farmer", phone: "+22370123456", name: "Utilisateur Test", role: "FARMER" }
    };
    
    listings.unshift(newListing);
    saveMockListings(listings);
    return newListing;
  }
  
  try {
    return await apiFetch<ListingItem>("/listings", {
      method: "POST",
      body: JSON.stringify(data)
    });
  } catch (err) {
    const listings = getMockListings();
    const newListing: ListingItem = {
      id: "mock-" + Date.now(),
      title: data.title,
      description: data.description || "",
      price: data.price,
      quantity: data.quantity,
      region: data.region,
      image: data.image || "https://images.unsplash.com/photo-1772984613890-e3bfbca7f245?w=400",
      farmerId: "mock-farmer",
      farmer: { id: "mock-farmer", phone: "+22370123456", name: "Utilisateur Test", role: "FARMER" }
    };
    listings.unshift(newListing);
    saveMockListings(listings);
    return newListing;
  }
}

export async function deleteListing(listingId: string) {
  const cfg = getConfig();
  
  if (!cfg.isApiAvailable || cfg.mockDataEnabled) {
    let listings = getMockListings();
    listings = listings.filter(l => l.id !== listingId);
    saveMockListings(listings);
    return { message: "Annonce supprimée" };
  }
  
  try {
    return await apiFetch<{ message: string }>(`/listings/${listingId}`, {
      method: "DELETE"
    });
  } catch (err) {
    let listings = getMockListings();
    listings = listings.filter(l => l.id !== listingId);
    saveMockListings(listings);
    return { message: "Annonce supprimée" };
  }
}

export async function updateListingQuantity(listingId: string, quantityToSubtract: number) {
  const cfg = getConfig();
  
  if (!cfg.isApiAvailable || cfg.mockDataEnabled) {
    let listings = getMockListings();
    const idx = listings.findIndex(l => l.id === listingId);
    if (idx !== -1) {
      listings[idx].quantity = Math.max(0, listings[idx].quantity - quantityToSubtract);
      saveMockListings(listings);
    }
    return;
  }
  
  try {
    // Dans une vraie app, on appellerait le backend
    await apiFetch(`/listings/${listingId}/stock`, {
      method: "PATCH",
      body: JSON.stringify({ decrementBy: quantityToSubtract })
    });
  } catch (err) {
    console.warn("[Listings] API indisponible pour maj stock, fallback mock", err);
    let listings = getMockListings();
    const idx = listings.findIndex(l => l.id === listingId);
    if (idx !== -1) {
      listings[idx].quantity = Math.max(0, listings[idx].quantity - quantityToSubtract);
      saveMockListings(listings);
    }
  }
}

export async function updateListing(listingId: string, updates: { price?: number; quantity?: number }) {
  const cfg = getConfig();
  
  if (!cfg.isApiAvailable || cfg.mockDataEnabled) {
    let listings = getMockListings();
    const idx = listings.findIndex(l => l.id === listingId);
    if (idx !== -1) {
      if (updates.price !== undefined) listings[idx].price = updates.price;
      if (updates.quantity !== undefined) listings[idx].quantity = updates.quantity;
      saveMockListings(listings);
      return listings[idx];
    }
    throw new Error("Annonce non trouvée");
  }
  
  try {
    return await apiFetch<ListingItem>(`/listings/${listingId}`, {
      method: "PATCH",
      body: JSON.stringify(updates)
    });
  } catch (err) {
    let listings = getMockListings();
    const idx = listings.findIndex(l => l.id === listingId);
    if (idx !== -1) {
      if (updates.price !== undefined) listings[idx].price = updates.price;
      if (updates.quantity !== undefined) listings[idx].quantity = updates.quantity;
      saveMockListings(listings);
      return listings[idx];
    }
    throw new Error("Annonce non trouvée");
  }
}
