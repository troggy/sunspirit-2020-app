import { createContext } from "preact";
import { Db } from "../lib/db";

export type DbContextType = {
  db: Db;
  storeName?: string;
  refresh: () => void;
};

export const DbContext = createContext<DbContextType | undefined>(undefined);
