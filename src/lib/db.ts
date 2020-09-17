import { openDB, DBSchema, IDBPDatabase } from "idb";
import { ArtistRecord, Artist } from "./types";
import { readMusicSpreadsheet, readSpreadsheet } from "./spreadsheet";

interface ArtistsDbSchema extends DBSchema {
  artists: {
    value: ArtistRecord;
    key: string;
    indexes: { "by-date": Date };
  };
  cinema: {
    value: ArtistRecord;
    key: string;
    indexes: { "by-date": Date };
  };
  knowledge: {
    value: ArtistRecord;
    key: string;
    indexes: { "by-date": Date };
  };
  theatre: {
    value: ArtistRecord;
    key: string;
    indexes: { "by-date": Date };
  };
  specificHealing: {
    value: ArtistRecord;
    key: string;
    indexes: { "by-date": Date };
  };
  popHealing: {
    value: ArtistRecord;
    key: string;
    indexes: { "by-date": Date };
  };
  musicHealing: {
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

const eventKey = (artist: Artist) => artist.personaLink.replace(/[^\w\d]/g, "");

export class Db {
  private readonly db: IDBPDatabase<ArtistsDbSchema>;

  private constructor(db: IDBPDatabase<ArtistsDbSchema>) {
    this.db = db;
  }

  static async init() {
    const db = await openDB<ArtistsDbSchema>("sunspiritApp", 10, {
      upgrade(db) {
        if (!db.objectStoreNames.contains("artists")) {
          const artistsStore = db.createObjectStore("artists", {
            keyPath: "normalizedName"
          });
          artistsStore.createIndex("by-date", "performanceDate");
        }

        if (!db.objectStoreNames.contains("cinema")) {
          const cinemaStore = db.createObjectStore("cinema", {
            keyPath: "normalizedName"
          });
          cinemaStore.createIndex("by-date", "performanceDate");
        }

        if (!db.objectStoreNames.contains("knowledge")) {
          const knowledgeStore = db.createObjectStore("knowledge", {
            keyPath: "normalizedName"
          });
          knowledgeStore.createIndex("by-date", "performanceDate");
        }

        if (!db.objectStoreNames.contains("theatre")) {
          const knowledgeStore = db.createObjectStore("theatre", {
            keyPath: "normalizedName"
          });
          knowledgeStore.createIndex("by-date", "performanceDate");
        }

        if (!db.objectStoreNames.contains("specificHealing")) {
          const knowledgeStore = db.createObjectStore("specificHealing", {
            keyPath: "normalizedName"
          });
          knowledgeStore.createIndex("by-date", "performanceDate");
        }

        if (!db.objectStoreNames.contains("popHealing")) {
          const knowledgeStore = db.createObjectStore("popHealing", {
            keyPath: "normalizedName"
          });
          knowledgeStore.createIndex("by-date", "performanceDate");
        }

        if (!db.objectStoreNames.contains("musicHealing")) {
          const knowledgeStore = db.createObjectStore("musicHealing", {
            keyPath: "normalizedName"
          });
          knowledgeStore.createIndex("by-date", "performanceDate");
        }
      }
    });
    return new Db(db);
  }

  async reloadMusic() {
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

  async downloadSingle(artist: ArtistRecord) {
    const withSample = await withDownloadedSample(artist);
    return this.db.put("artists", withSample);
  }

  async getArtists() {
    return this.db.getAll("artists");
  }

  async pendingArtists() {
    return this.getArtists().then((artists) =>
      artists.filter((a) => !a.sampleBuffer && a.sampleLink)
    );
  }

  async getAll(storeName: string) {
    return this.db.getAll(storeName as any);
  }

  async getKnowledgeEvents() {
    return this.getAll("knowledge");
  }

  async getCinemaEvents() {
    return this.getAll("cinema");
  }

  async reload(storeName: any) {
    const events = await readSpreadsheet(storeName);
    const existingEvents = await this.getAll(storeName);
    existingEvents
      .filter((a) => !events.find((a1) => eventKey(a1) === a.normalizedName))
      .forEach(async (a) => this.db.delete(storeName, a.normalizedName));

    return Promise.all(
      events.map(async (event) => {
        const evKey = eventKey(event);
        return this.db
          .get(storeName, evKey)
          .then((existingEvent) => {
            if (!existingEvent) return event;
            return {
              ...existingEvent,
              ...event
            };
          })
          .then(async (event) => {
            return this.db.put(storeName, {
              ...event,
              normalizedName: evKey
            });
          });
      })
    );
  }

  async toggleFav(storeName: any, entry: ArtistRecord) {
    return this.db.put(storeName, {
      ...entry,
      fav: !entry.fav
    });
  }
}
