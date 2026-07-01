import type { IncomingOrder } from "@/types/verification";

export const SAMPLE_BOTTLE_PHOTOS = [
  "https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?w=400",
  "https://images.unsplash.com/photo-1621451537084-482c73073a0f?w=400",
  "https://images.unsplash.com/photo-1604187351574-c75ca79f5807?w=400",
  "https://images.unsplash.com/photo-1572098661174-87690fb6c527?w=400",
];

export const seed: IncomingOrder[] = [
  {
    id: "ORD-4821", bagQr: "QR-EV-4821-A", citizenName: "Ahmed Hassan", driverName: "Mostafa Adel",
    expectedType: "PET", expectedQty: 6, expectedWeightKg: 0.6, pointsToAward: 60,
    citizenPhoto: SAMPLE_BOTTLE_PHOTOS[0],
  },
  {
    id: "ORD-4822", bagQr: "QR-EV-4822-B", citizenName: "Fatma Mohamed", driverName: "Mostafa Adel",
    expectedType: "HDPE", expectedQty: 4, expectedWeightKg: 0.4, pointsToAward: 40,
    citizenPhoto: SAMPLE_BOTTLE_PHOTOS[2],
  },
  {
    id: "ORD-4823", bagQr: "QR-EV-4823-C", citizenName: "Omar Ali", driverName: "Hany Saeed",
    expectedType: "PET", expectedQty: 9, expectedWeightKg: 0.9, pointsToAward: 90,
    citizenPhoto: SAMPLE_BOTTLE_PHOTOS[3],
  },
];
