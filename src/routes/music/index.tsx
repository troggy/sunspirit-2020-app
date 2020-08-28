import { FunctionalComponent, h } from "preact";
import * as style from "./style.css";
import { useState, useEffect } from "preact/hooks";
import Loading from "../../components/loading";

// eslint-disable-next-line  @typescript-eslint/no-var-requires
const Tabletop = require("tabletop");

type Artist = {
  name: string;
  personaLink: string;
  announcementLink: string;
  sampleLink: string;
  performanceDate: string;
  imageLink: string;
  stage: string;
};

type StageProps = {
  name: string;
  artists: Artist[];
};

const MusicEvent = ({ artist }: { artist: Artist }) => {
  return (
    <div className={style.musicEvent}>
      <div>{artist.name}</div>
      <div>{artist.stage}</div>
    </div>
  );
};

const Stage: FunctionalComponent<StageProps> = ({
  name,
  artists
}: StageProps) => {
  return (
    <div>
      <h3>{name}</h3>
      {artists.map((a) => (
        <MusicEvent key={a.name} artist={a} />
      ))}
    </div>
  );
};

const Music: FunctionalComponent = () => {
  const [data, setData] = useState<{ [stage: string]: Artist[] } | null>(null);

  useEffect(() => {
    Tabletop.init({
      key:
        "https://docs.google.com/spreadsheets/d/1fGLxOfXsMIIbz0KKjM6bj9ChBb1dMQTY9KxiVDOR8JI/edit?usp=sharing"
    }).then(function (data: any) {
      const artists = data["Музыка"].all() as Artist[];
      const artistsByDate: { [stage: string]: Artist[] } = {};

      artists.forEach((artist) => {
        artistsByDate[artist.performanceDate] = [
          ...(artistsByDate[artist.performanceDate] || []),
          artist
        ];
      });

      setData(artistsByDate);
    });
  }, []);

  return (
    <div className={`${style.home} ${data ? "" : style.homeLoading}`}>
      {!data && <Loading />}
      {data &&
        Object.keys(data)
          .sort()
          .filter((d) => Boolean(d))
          .map((date) => <Stage key={date} name={date} artists={data[date]} />)}
    </div>
  );
};

export default Music;
