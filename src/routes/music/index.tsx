import { FunctionalComponent, h } from "preact";
import * as style from "./style.css";
import { useState, useEffect } from "preact/hooks";
import Loading from "../../components/loading";
import { ArtistRecord } from "../../lib/types";
import { Db } from "../../lib/db";
import PlayButton from "../../components/PlayButton";
import styled from "styled-components";

type StageProps = {
  name: string;
  artists: ArtistRecord[];
};

const Time = styled.div`
  width: 50px;
`;

const ArtistName = styled.div`
  flex: 1;
`;

const StageName = styled.div``;

const PlayCell = styled.div`
  width: 34px;
`;

const MusicEvent = ({ artist }: { artist: ArtistRecord }) => {
  return (
    <div className={style.musicEvent}>
      <Time>{artist.performanceTime}</Time>
      <ArtistName>{artist.name}</ArtistName>
      <StageName>{artist.stage}</StageName>
      <PlayCell>
        {artist.sampleBuffer && <PlayButton data={artist.sampleBuffer} />}
      </PlayCell>
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

const toDate = (time: string) => {
  const d = new Date();
  if (!time) return d;
  const [hours, minutes] = time.split(":");
  d.setHours(Number.parseInt(hours, 10));
  d.setMinutes(Number.parseInt(minutes, 10));
  if (Number.parseInt(hours, 10) < 10) {
    d.setDate(d.getDate() + 1);
  }

  return d;
};

const Music: FunctionalComponent = () => {
  const [artistsByDate, setArtistsByDate] = useState<{
    [stage: string]: ArtistRecord[];
  } | null>(null);
  const [artists, setArtists] = useState<ArtistRecord[]>([]);

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

    const artistsByDate: { [stage: string]: ArtistRecord[] } = {};

    artists.forEach((artist) => {
      if (!artistsByDate[artist.performanceDate]) {
        artistsByDate[artist.performanceDate] = [];
      }

      artistsByDate[artist.performanceDate].push(artist);
    });

    Object.keys(artistsByDate).forEach((date) => {
      artistsByDate[date] = artistsByDate[date].sort((a, b) =>
        toDate(a.performanceTime) > toDate(b.performanceTime) ? 1 : -1
      );
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
