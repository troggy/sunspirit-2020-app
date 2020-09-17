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
        return this.db
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
            ) {
              return mergedRecord;
            }

            return {
              ...mergedRecord,
              sampleBuffer: undefined
            };
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

  async getDownloadSize() {
    const pendingArtists = await this.pendingArtists();
    let total = 0;
    await Promise.all(
      pendingArtists.map(async (a) =>
        fetch(a.sampleLink, { method: "HEAD" }).then((response) => {
          total += Number.parseInt(
            response.headers.get("Content-Length") ?? "0",
            10
          );
        })
      )
    );
    return total;
  }

  async downloadSamples(onProgress: (current: number, total: number) => void) {
    const pendingArtists = await this.pendingArtists();
    const totalSize = await this.getDownloadSize();
    let done = 0;
    return Promise.all(
      pendingArtists.map(async (artist) => {
        const withSample = await withDownloadedSample(artist);
        if (withSample.sampleBuffer) {
          onProgress((done += withSample.sampleBuffer.size), totalSize);
        }

        return this.db.put("artists", withSample);
      })
    );
  }

  async getArtists() {
    return this.db.getAll("artists");
  }

  async pendingArtists() {
    return this.getArtists().then((artists) =>
      artists.filter((a) => !a.sampleBuffer && a.sampleLink)
    );
  }
}
