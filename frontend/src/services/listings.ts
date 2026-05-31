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

/**
 * Données mockées pour les listings en mode développement
 */
const MOCK_LISTINGS: ListingItem[] = [
  {
    id: "1",
    title: "Tomates fraîches",
    description: "Tomates cultivées de manière écologique",
    price: 750,
    quantity: 500,
    region: "Sikasso",
    image: "https://images.unsplash.com/photo-1758487405872-8e179dfe703e?w=400",
    farmerId: "farmer-1",
    farmer: {
      id: "farmer-1",
      phone: "+22370123456",
      name: "Amadou Traoré",
      role: "FARMER"
    }
  },
  {
    id: "2",
    title: "Oignons blancs",
    description: "Oignons de qualité supérieure",
    price: 500,
    quantity: 800,
    region: "Kayes",
    image: "https://images.unsplash.com/photo-1534383346555-6cff1eaca960?w=400",
    farmerId: "farmer-2",
    farmer: {
      id: "farmer-2",
      phone: "+22370234567",
      name: "Fatoumata Keita",
      role: "FARMER"
    }
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
    farmer: {
      id: "farmer-3",
      phone: "+22370345678",
      name: "Ibrahim Coulibaly",
      role: "FARMER"
    }
  }
];

/**
 * Récupère toutes les annonces
 * Utilise la logique de bascule automatique entre API réelle et mode simulé
 */
export async function fetchListings() {
  const cfg = getConfig();
  
  if (!cfg.isApiAvailable || cfg.mockDataEnabled) {
    console.log("[Mock Listings] Utilisation des données mockées");
    return MOCK_LISTINGS;
  }
  
  return apiFetch<ListingItem[]>("/listings");
}

/**
 * Récupère les annonces de l'utilisateur connecté
 * Utilise la logique de bascule automatique entre API réelle et mode simulé
 */
export async function fetchMyListings() {
  const cfg = getConfig();
  
  if (!cfg.isApiAvailable || cfg.mockDataEnabled) {
    console.log("[Mock Listings] Utilisation des données mockées pour mes annonces");
    return MOCK_LISTINGS.slice(0, 2); // Retourner 2 annonces fictives
  }
  
  return apiFetch<ListingItem[]>("/listings/mine");
}

/**
 * Crée une nouvelle annonce
 * Utilise la logique de bascule automatique entre API réelle et mode simulé
 */
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
    console.log("[Mock Listings] Création d'annonce simulée");
    
    const newListing: ListingItem = {
      id: "mock-" + Date.now(),
      title: data.title,
      description: data.description || "",
      price: data.price,
      quantity: data.quantity,
      region: data.region,
      image: data.image || "https://images.unsplash.com/photo-1772984613890-e3bfbca7f245?w=400",
      farmerId: "mock-farmer",
      farmer: {
        id: "mock-farmer",
        phone: "+22370123456",
        name: "Utilisateur Test",
        role: "FARMER"
      }
    };
    
    return newListing;
  }
  
  return apiFetch<ListingItem>("/listings", {
    method: "POST",
    body: JSON.stringify(data)
  });
}

/**
 * Supprime une annonce
 * Utilise la logique de bascule automatique entre API réelle et mode simulé
 */
export async function deleteListing(listingId: string) {
  const cfg = getConfig();
  
  if (!cfg.isApiAvailable || cfg.mockDataEnabled) {
    console.log(`[Mock Listings] Suppression d'annonce simulée: ${listingId}`);
    return { message: "Annonce supprimée (mode simulé)" };
  }
  
  return apiFetch<{ message: string }>(`/listings/${listingId}`, {
    method: "DELETE"
  });
}
