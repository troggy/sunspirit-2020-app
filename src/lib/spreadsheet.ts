import { Artist } from "./types";

// eslint-disable-next-line  @typescript-eslint/no-var-requires
const Tabletop = require("tabletop");

export const readSpreadsheet = async (sheetName: string): Promise<Artist[]> => {
  return Tabletop.init({
    key:
      "https://docs.google.com/spreadsheets/d/1fGLxOfXsMIIbz0KKjM6bj9ChBb1dMQTY9KxiVDOR8JI/pubhtml"
  }).then(function (data: any) {
    return data[sheetName].all() as Artist[];
  });
};

export const readMusicSpreadsheet = async (): Promise<Artist[]> =>
  readSpreadsheet("Музыка");
