import { openDB, DBSchema, IDBPDatabase } from "idb";
import { ArtistRecord } from "./types";
import { readMusicSpreadsheet } from "./spreadsheet";

interface ArtistsDbSchema extends DBSchema {
  artists: {
    value: ArtistRecord;
    key: string;
    indexes: { "by-date": Date };
  };
}

export class Db {
  private readonly db: IDBPDatabase<ArtistsDbSchema>;

  private constructor(db: IDBPDatabase<ArtistsDbSchema>) {
    this.db = db;
  }

  static async init() {
    const db = await openDB<ArtistsDbSchema>("sunspiritApp", 1, {
      upgrade(db) {
        const artistsStore = db.createObjectStore("artists", {
          keyPath: "normalizedName"
        });
        artistsStore.createIndex("by-date", "performanceDate");
      }
    });
    return new Db(db);
  }

  async reload() {
    const artists = await readMusicSpreadsheet();
    return Promise.all(
      artists.map(async (artist: any) =>
        this.db.put("artists", {
          ...artist,
          normalizedName: artist.name.replace(/[^\w\d]/g, "")
        })
      )
    );
  }

  async getArtists() {
    return this.db.getAll("artists");
  }
}
