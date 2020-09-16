import { openDB, DBSchema, IDBPDatabase } from "idb";
import { ArtistRecord, Artist } from "./types";
import { readMusicSpreadsheet } from "./spreadsheet";

interface ArtistsDbSchema extends DBSchema {
  artists: {
    value: ArtistRecord;
    key: string;
    indexes: { "by-date": Date };
  };
}

const withDownloadedSample = async (artist: ArtistRecord) => {
  if (!artist.sampleLink) return artist;
  const blob = await fetch(artist.sampleLink).then(async (response) =>
    response.blob()
  );
  return {
    ...artist,
    sampleBuffer: blob
  };
};

const key = (artist: Artist) => artist.name.replace(/[^\w\d]/g, "");

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
    const existingArtists = await this.getArtists();
    existingArtists
      .filter((a) => !artists.find((a1) => key(a1) === a.normalizedName))
      .forEach(async (a) => this.db.delete("artists", a.normalizedName));

    return Promise.all(
      artists.map(async (artist) => {
        const artistKey = key(artist);
        void this.db
          .get("artists", artistKey)
          .then((existingArtist) => {
            if (!existingArtist) return artist;
            const mergedRecord = {
              ...existingArtist,
              ...artist
            };
            // Sample is not changed and is already downloaded
            if (
              existingArtist.sampleLink === artist.sampleLink &&
              existingArtist.sampleBuffer
            )
              return mergedRecord;
            return withDownloadedSample(mergedRecord);
          })
          .then(async (artist) => {
            return this.db.put("artists", {
              ...artist,
              normalizedName: artistKey
            });
          });
      })
    );
  }

  async getArtists() {
    return this.db.getAll("artists");
  }
}
