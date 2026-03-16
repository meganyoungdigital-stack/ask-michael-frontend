import { connectToDatabase } from "@/lib/mongodb";

export interface AppUser {
  clerkId: string;
  isPro: boolean;
  createdAt: Date;
}

export async function getOrCreateUser(
  clerkId: string
): Promise<AppUser> {
  const { db } = await connectToDatabase();

  const existingUser = await db
    .collection<AppUser>("users")
    .findOne({ clerkId });

  if (existingUser) {
    return existingUser;
  }

  const newUser: AppUser = {
    clerkId,
    isPro: false,
    createdAt: new Date(),
  };

  await db.collection("users").insertOne(newUser);

  return newUser; // ✅ No null possible here
}

export async function getUserByClerkId(
  clerkId: string
): Promise<AppUser | null> {
  const { db } = await connectToDatabase();

  return db
    .collection<AppUser>("users")
    .findOne({ clerkId });
}