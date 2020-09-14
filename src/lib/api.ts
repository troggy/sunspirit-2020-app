// eslint-disable-next-line  @typescript-eslint/no-var-requires
const Tabletop = require("tabletop");

export type Artist = {
  name: string;
  personaLink: string;
  announcementLink: string;
  sampleLink: string;
  performanceDate: string;
  imageLink: string;
  stage: string;
};

export const readMusicSpreadsheet = async () => {
  return Tabletop.init({
    key:
      "https://docs.google.com/spreadsheets/d/1fGLxOfXsMIIbz0KKjM6bj9ChBb1dMQTY9KxiVDOR8JI/edit?usp=sharing"
  }).then(function (data: any) {
    return data["Музыка"].all() as Artist[];
  });
};
