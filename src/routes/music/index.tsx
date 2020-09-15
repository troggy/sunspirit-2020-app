import { FunctionalComponent, h } from "preact";
import * as style from "./style.css";
import { useState, useEffect } from "preact/hooks";
import Loading from "../../components/loading";
import { Artist } from "../../lib/types";
import { Db } from "../../lib/db";

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
  const [artistsByDate, setArtistsByDate] = useState<{
    [stage: string]: Artist[];
  } | null>(null);
  const [artists, setArtists] = useState<Artist[]>([]);

  useEffect(() => {
    void Db.init()
      .then(async (db) => Promise.all([db, db.getArtists()]))
      .then(async ([db, artists]) => {
        setArtists(artists);
        return db.reload();
      });
  }, []);

  useEffect(() => {
    if (!artists || artists.length === 0) return;

    const artistsByDate: { [stage: string]: Artist[] } = {};

    artists.forEach((artist) => {
      if (!artistsByDate[artist.performanceDate]) {
        artistsByDate[artist.performanceDate] = [];
      }

      artistsByDate[artist.performanceDate].push(artist);
    });

    setArtistsByDate(artistsByDate);
  }, [artists]);

  return (
    <div className={`${style.home} ${artistsByDate ? "" : style.homeLoading}`}>
      {!artistsByDate && <Loading />}
      {artistsByDate &&
        Object.keys(artistsByDate)
          .sort()
          .filter((d) => Boolean(d))
          .map((date) => (
            <Stage key={date} name={date} artists={artistsByDate[date]} />
          ))}
    </div>
  );
};

export default Music;
