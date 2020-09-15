export type Artist = {
  name: string;
  personaLink: string;
  announcementLink: string;
  sampleLink: string;
  performanceDate: string;
  imageLink: string;
  stage: string;
};

export type ArtistRecord = Artist & {
  normalizedName: string;
  sampleBuffer?: Blob;
};
