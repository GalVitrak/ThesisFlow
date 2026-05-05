import { getDataSource } from "./dataSource";
import { getDb } from "@/lib/mock/store";
import type { User } from "@/lib/types";
import * as firebaseUser from "./firebase/userService.firebase";

export async function getUserById(id: string): Promise<User | null> {
  if (getDataSource() === "firebase") {
    return firebaseUser.getUserById(id);
  }
  return getDb().users.find((u) => u.id === id) ?? null;
}

export async function listUsers(): Promise<User[]> {
  if (getDataSource() === "firebase") {
    return firebaseUser.listUsers();
  }
  return getDb().users;
}
