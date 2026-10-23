
export type Profile = {
  id: string;
  name: string;
  age: number;
  bio: string;
  interests: string[];
  photo: string;
};

type DemoProfile = Profile & {
  mutualLike: boolean;
};

export const demoProfiles: DemoProfile[] = [
  {
    id: "p1",
    name: "Ava",
    age: 24,
    bio: "Coffee, sunsets, and spontaneous adventures.",
    interests: ["Travel", "Coffee", "Music"],
    photo:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800",
    mutualLike: true,
  },
  {
    id: "p2",
    name: "Mia",
    age: 23,
    bio: "Book lover, amateur cook, weekend explorer.",
    interests: ["Books", "Cooking", "Nature"],
    photo:
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=800",
    mutualLike: false,
  },
  {
    id: "p3",
    name: "Sofia",
    age: 25,
    bio: "Art, good food, and discovering new places.",
    interests: ["Art", "Food", "Photography"],
    photo:
      "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=800",
    mutualLike: true,
  },
];

export const decisions = new Map<string, "like" | "pass">();
export const matchedIds = new Set<string>();

export function publicProfile(profile: DemoProfile): Profile {
  const { mutualLike: _private, ...result } = profile;
  return result;
}