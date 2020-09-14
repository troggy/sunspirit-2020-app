import { FunctionalComponent, h } from "preact";
import * as style from "./style.css";
import { useState, useEffect } from "preact/hooks";
import Loading from "../../components/loading";
import { Artist, readMusicSpreadsheet } from "../../lib/api";

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
    void readMusicSpreadsheet().then((artists: Artist[]) => {
      const artistsByDate: { [stage: string]: Artist[] } = {};

      artists.forEach((artist) => {
        if (!artistsByDate[artist.performanceDate]) {
          artistsByDate[artist.performanceDate] = [];
        }

        artistsByDate[artist.performanceDate].push(artist);
      });

      return setData(artistsByDate);
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
