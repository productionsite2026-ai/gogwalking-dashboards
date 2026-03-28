// Demo data for dashboard preview when no real data exists

export const DEMO_WALKERS = [
  { id: '1', name: 'Lucas', lastName: 'Bernard', city: 'Paris', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200', rating: 4.9, reviews: 47, walks: 156, verified: true, experience: 5, hourlyRate: 18, bio: 'Éducateur canin certifié, 5 ans d\'expérience.' },
  { id: '2', name: 'Julie', lastName: 'Dubois', city: 'Lyon', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200', rating: 4.7, reviews: 32, walks: 98, verified: true, experience: 3, hourlyRate: 15, bio: 'Passionnée des animaux, diplômée en comportement canin.' },
  { id: '3', name: 'Maxime', lastName: 'Roux', city: 'Marseille', avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200', rating: 4.8, reviews: 28, walks: 112, verified: true, experience: 4, hourlyRate: 20, bio: 'Runner et amoureux des chiens.' },
  { id: '4', name: 'Léa', lastName: 'Garcia', city: 'Bordeaux', avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200', rating: 5.0, reviews: 15, walks: 67, verified: true, experience: 7, hourlyRate: 22, bio: 'Vétérinaire de formation.' },
  { id: '5', name: 'Antoine', lastName: 'Martinez', city: 'Toulouse', avatar: 'https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=200', rating: 4.6, reviews: 21, walks: 45, verified: false, experience: 2, hourlyRate: 16, bio: 'Pet-sitter professionnel certifié.' },
];

export const DEMO_OWNERS = [
  { id: '1', name: 'Sophie', lastName: 'Martin', city: 'Paris', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200' },
  { id: '2', name: 'Pierre', lastName: 'Durand', city: 'Lyon', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200' },
  { id: '3', name: 'Camille', lastName: 'Leroy', city: 'Marseille', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200' },
  { id: '4', name: 'Thomas', lastName: 'Moreau', city: 'Bordeaux', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200' },
  { id: '5', name: 'Emma', lastName: 'Petit', city: 'Toulouse', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200' },
];

export const DEMO_DOGS = [
  { id: '1', name: 'Max', breed: 'Labrador Retriever', age: 4, weight: 32, size: 'large' as const, photo: 'https://images.unsplash.com/photo-1579996232976-000e9f6fd1a2?w=300', ownerId: '1' },
  { id: '2', name: 'Bella', breed: 'Labrador Retriever', age: 3, weight: 28, size: 'large' as const, photo: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=300', ownerId: '1' },
  { id: '3', name: 'Rex', breed: 'Berger Allemand', age: 5, weight: 38, size: 'large' as const, photo: 'https://images.unsplash.com/photo-1589941013453-ec89f33b5e95?w=300', ownerId: '2' },
  { id: '4', name: 'Pixel', breed: 'Chihuahua', age: 3, weight: 2, size: 'small' as const, photo: 'https://images.unsplash.com/photo-1583337130417-13104dec14a3?w=300', ownerId: '3' },
  { id: '5', name: 'Charlie', breed: 'Golden Retriever', age: 4, weight: 30, size: 'large' as const, photo: 'https://images.unsplash.com/photo-1633722715463-d30f4f325e24?w=300', ownerId: '4' },
  { id: '6', name: 'Luna', breed: 'Border Collie', age: 3, weight: 18, size: 'medium' as const, photo: 'https://images.unsplash.com/photo-1503256207526-0d5d80fa2f47?w=300', ownerId: '5' },
];

export const DEMO_REVIEWS = [
  { id: '1', rating: 5, comment: 'Lucas est fantastique avec Max ! Très professionnel et ponctuel.', reviewerName: 'Sophie', reviewerAvatar: DEMO_OWNERS[0].avatar, date: '10 mars 2026', walkerId: '1' },
  { id: '2', rating: 5, comment: 'Encore une super promenade pour Bella. Merci Lucas !', reviewerName: 'Sophie', reviewerAvatar: DEMO_OWNERS[0].avatar, date: '12 mars 2026', walkerId: '1' },
  { id: '3', rating: 4, comment: 'Julie est douce avec Rex, il l\'adore.', reviewerName: 'Pierre', reviewerAvatar: DEMO_OWNERS[1].avatar, date: '8 mars 2026', walkerId: '2' },
  { id: '4', rating: 5, comment: 'Maxime a pris soin de Pixel comme si c\'était le sien.', reviewerName: 'Camille', reviewerAvatar: DEMO_OWNERS[2].avatar, date: '15 mars 2026', walkerId: '3' },
  { id: '5', rating: 5, comment: 'Léa est exceptionnelle. Charlie était ravi !', reviewerName: 'Thomas', reviewerAvatar: DEMO_OWNERS[3].avatar, date: '5 mars 2026', walkerId: '4' },
  { id: '6', rating: 4, comment: 'Antoine est gentil, Luna a bien profité.', reviewerName: 'Emma', reviewerAvatar: DEMO_OWNERS[4].avatar, date: '14 mars 2026', walkerId: '5' },
];

export const DEMO_BOOKINGS = [
  { id: '1', dogName: 'Max', dogPhoto: DEMO_DOGS[0].photo, ownerName: 'Sophie', ownerAvatar: DEMO_OWNERS[0].avatar, walkerName: 'Lucas', walkerAvatar: DEMO_WALKERS[0].avatar, date: '25 mars', time: '09:00', duration: 60, price: 18, status: 'confirmed' as const, service: 'Promenade' },
  { id: '2', dogName: 'Rex', dogPhoto: DEMO_DOGS[2].photo, ownerName: 'Pierre', ownerAvatar: DEMO_OWNERS[1].avatar, walkerName: 'Julie', walkerAvatar: DEMO_WALKERS[1].avatar, date: '26 mars', time: '14:00', duration: 60, price: 15, status: 'pending' as const, service: 'Promenade' },
  { id: '3', dogName: 'Pixel', dogPhoto: DEMO_DOGS[3].photo, ownerName: 'Camille', ownerAvatar: DEMO_OWNERS[2].avatar, walkerName: 'Maxime', walkerAvatar: DEMO_WALKERS[2].avatar, date: '27 mars', time: '16:00', duration: 30, price: 10, status: 'pending' as const, service: 'Visite' },
  { id: '4', dogName: 'Charlie', dogPhoto: DEMO_DOGS[4].photo, ownerName: 'Thomas', ownerAvatar: DEMO_OWNERS[3].avatar, walkerName: 'Léa', walkerAvatar: DEMO_WALKERS[3].avatar, date: '24 mars', time: '10:00', duration: 60, price: 22, status: 'confirmed' as const, service: 'Promenade' },
];

// New mock data format for dashboard-v2 components
export const mockDogs = [
  { id: "demo-1", name: "Max", breed: "Golden Retriever", age: 3, size: "large" as const, weight: 30, photo_url: null, temperament: "Joueur", special_needs: null, is_neutered: true, vaccinations_up_to_date: true, owner_id: "demo", created_at: null, updated_at: null },
  { id: "demo-2", name: "Bella", breed: "Caniche", age: 5, size: "small" as const, weight: 8, photo_url: null, temperament: "Calme", special_needs: null, is_neutered: true, vaccinations_up_to_date: true, owner_id: "demo", created_at: null, updated_at: null },
];

export const mockBookings = [
  {
    id: "demo-b1", dog_id: "demo-1", owner_id: "demo", walker_id: null,
    scheduled_date: new Date(Date.now() + 86400000).toISOString().split("T")[0],
    scheduled_time: "09:00", duration_minutes: 30, status: "confirmed" as const,
    service_type: "promenade" as const, address: "Parc de la Tête d'Or, Lyon",
    notes: null, price: 15, created_at: null, updated_at: null,
    owner_confirmed: true, walker_confirmed: true, cancellation_reason: null,
    cancelled_by: null, latitude: null, longitude: null, city: "Lyon",
    dogs: { name: "Max", breed: "Golden Retriever", photo_url: null },
  },
  {
    id: "demo-b2", dog_id: "demo-2", owner_id: "demo", walker_id: null,
    scheduled_date: new Date(Date.now() + 172800000).toISOString().split("T")[0],
    scheduled_time: "14:00", duration_minutes: 45, status: "pending" as const,
    service_type: "promenade" as const, address: "Jardin du Luxembourg, Paris",
    notes: null, price: 20, created_at: null, updated_at: null,
    owner_confirmed: false, walker_confirmed: false, cancellation_reason: null,
    cancelled_by: null, latitude: null, longitude: null, city: "Paris",
    dogs: { name: "Bella", breed: "Caniche", photo_url: null },
  },
];

export const mockWalkerProfile = {
  id: "demo-wp", user_id: "demo", hourly_rate: 18, max_dogs: 4,
  experience_years: 5, rating: 4.8, total_reviews: 47, total_walks: 312,
  verified: true, services: ["promenade", "garde", "visite"] as const,
  available_days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
  available_hours_start: "08:00", available_hours_end: "19:00",
  service_radius_km: 10, latitude: null, longitude: null,
  created_at: null, updated_at: null,
};

export const mockProfile = {
  id: "demo", email: "demo@dogwalking.fr", first_name: "Marie",
  last_name: "Dupont", bio: "Passionnée par les animaux depuis toujours 🐾",
  avatar_url: null, city: "Lyon", address: null, phone: null,
  postal_code: null, user_type: "both" as const,
  created_at: null, updated_at: null,
};

export const mockNearbyWalkers = [
  {
    id: "w1", user_id: "w1", rating: 4.9, total_reviews: 89, hourly_rate: 15,
    verified: true, total_walks: 456, experience_years: 7, max_dogs: 3,
    services: ["promenade"] as any, available_days: null, available_hours_start: null,
    available_hours_end: null, service_radius_km: 5, latitude: null, longitude: null,
    created_at: null, updated_at: null,
    profiles: { id: "w1", first_name: "Lucas", last_name: "Martin", avatar_url: null },
  },
  {
    id: "w2", user_id: "w2", rating: 4.7, total_reviews: 34, hourly_rate: 12,
    verified: true, total_walks: 178, experience_years: 3, max_dogs: 4,
    services: ["promenade", "garde"] as any, available_days: null, available_hours_start: null,
    available_hours_end: null, service_radius_km: 8, latitude: null, longitude: null,
    created_at: null, updated_at: null,
    profiles: { id: "w2", first_name: "Sophie", last_name: "Bernard", avatar_url: null },
  },
  {
    id: "w3", user_id: "w3", rating: 4.5, total_reviews: 21, hourly_rate: 18,
    verified: false, total_walks: 95, experience_years: 2, max_dogs: 2,
    services: ["promenade"] as any, available_days: null, available_hours_start: null,
    available_hours_end: null, service_radius_km: 3, latitude: null, longitude: null,
    created_at: null, updated_at: null,
    profiles: { id: "w3", first_name: "Emma", last_name: "Petit", avatar_url: null },
  },
];

export const mockEarnings = { today: 45, week: 215, month: 890, trend: 12 };

export const mockUpcomingBookings = [
  { id: "1", dogName: "Max", date: "Lun 24 Mars", time: "09:00", duration: "30 min", status: "confirmée" as const },
  { id: "2", dogName: "Bella", date: "Mar 25 Mars", time: "14:00", duration: "45 min", status: "en_attente" as const },
  { id: "3", dogName: "Rocky", date: "Mer 26 Mars", time: "10:30", duration: "60 min", status: "confirmée" as const },
];
