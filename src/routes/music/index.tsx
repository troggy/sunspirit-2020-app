import { FunctionalComponent, h } from "preact";
import * as style from "./style.css";
import { useState, useEffect, useCallback } from "preact/hooks";
import Loading from "../../components/loading";
import { ArtistRecord } from "../../lib/types";
import { Db } from "../../lib/db";
import PlayButton from "../../components/PlayButton";
import styled from "styled-components";
import {
  PlayerContext,
  PlayerContextType,
  defaultPlayerState
} from "../../components/playerContext";

const Time = styled.div`
  width: 50px;
`;

const ArtistName = styled.div`
  flex: 1;
`;

const colors: { [name: string]: string } = {
  электронная1: "#FF5C00"
};

const Badge = styled.span<{ bgColor: string }>`
  padding: 0 4px;
  border-radius: 2px;
  height: 24px;
  padding-top: 1px;
  background-color: ${(props) => props.bgColor};
`;

const StageName = ({ name }: { name: string }) => {
  return <Badge bgColor={colors[name]}>{name}</Badge>;
};

const PlayCell = styled.div`
  width: 34px;
`;

type MusicEventProps = {
  artist: ArtistRecord;
};

const MusicEvent = ({ artist }: MusicEventProps) => {
  return (
    <div className={style.musicEvent}>
      <Time>{artist.performanceTime}</Time>
      <ArtistName>{artist.name}</ArtistName>
      <StageName name={artist.stage} />
      <PlayCell>
        {artist.sampleBuffer && <PlayButton data={artist.sampleBuffer} />}
      </PlayCell>
    </div>
  );
};

type StageProps = {
  name: string;
  artists: ArtistRecord[];
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

const audio = new Audio();

const onStop = () => audio.pause();

const Music: FunctionalComponent = () => {
  const [artistsByDate, setArtistsByDate] = useState<{
    [stage: string]: ArtistRecord[];
  } | null>(null);
  const [artists, setArtists] = useState<ArtistRecord[]>([]);
  const [playerState, setPlayerState] = useState<PlayerContextType>(
    defaultPlayerState
  );

  const onPlay = useCallback((src: string) => {
    setPlayerState((playerState: PlayerContextType) => ({
      ...playerState,
      onPlay,
      onStop,
      src
    }));
    audio.pause();
    audio.src = src;
    void audio.play();
  }, []);

  useEffect(() => {
    void setPlayerState((playerState: PlayerContextType) => ({
      ...playerState,
      onPlay,
      onStop
    }));
  }, [onPlay]);

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
    <PlayerContext.Provider value={playerState}>
      <div
        className={`${style.home} ${artistsByDate ? "" : style.homeLoading}`}
      >
        {!artistsByDate && <Loading />}
        {artistsByDate &&
          Object.keys(artistsByDate)
            .sort()
            .filter((d) => Boolean(d))
            .map((date) => (
              <Stage key={date} name={date} artists={artistsByDate[date]} />
            ))}
      </div>
    </PlayerContext.Provider>
  );
};

export default Music;
