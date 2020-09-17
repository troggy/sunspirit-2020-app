import { FunctionalComponent, h, Fragment } from "preact";
import * as style from "./style.css";
import {
  useState,
  useEffect,
  useCallback,
  useLayoutEffect
} from "preact/hooks";
import Loading from "../../components/loading";
import { ArtistRecord } from "../../lib/types";
import { Db } from "../../lib/db";
import PlayButton from "../../components/PlayButton";
import styled from "styled-components";
import { check, watch } from "is-offline";
import {
  PlayerContext,
  PlayerContextType,
  defaultPlayerState
} from "../../components/player-context";
import { DownloadIcon, NoSignal } from "../../components/icons";

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

const DownloadButton = ({
  size,
  onClick
}: {
  size: number;
  onClick: () => void;
}) => {
  return (
    <div
      style={{
        alignItems: "center",
        display: "flex",
        cursor: "pointer"
      }}
      onClick={onClick}
    >
      <DownloadIcon /> {Math.round(size / 1000000)}Мб
    </div>
  );
};

const DownloadProgress = ({
  current,
  total
}: {
  current: number;
  total: number;
}) => {
  return (
    <div>
      {Math.round(current / 1000000)}/{Math.round(total / 1000000)}Мб
    </div>
  );
};

/* eslint-disable @typescript-eslint/no-empty-function */
let audio = {
  src: "",
  pause: () => {},
  play: () => {}
};
/* eslint-enable @typescript-eslint/no-empty-function */

if (typeof window !== "undefined") {
  audio = new Audio();
}

const onStop = () => audio.pause();

const Music: FunctionalComponent = () => {
  const [artistsByDate, setArtistsByDate] = useState<{
    [stage: string]: ArtistRecord[];
  } | null>(null);
  const [artists, setArtists] = useState<ArtistRecord[]>([]);
  const [playerState, setPlayerState] = useState<PlayerContextType>(
    defaultPlayerState
  );

  const [db, setDb] = useState<Db | null>(null);
  const [pendingDownload, setPendingDownload] = useState<number>(0);
  const [downloadProgress, setDownloadProgress] = useState<{
    current: number;
    total: number;
  }>({ current: 0, total: 0 });
  const [offline, setOffline] = useState<boolean>(false);

  useLayoutEffect(() => {
    void Db.init().then((db) => setDb(db));
  }, []);

  useEffect(() => {
    void check().then((isOffline: boolean) => {
      if (isOffline) return setOffline(isOffline);
      return fetch("https://sunspirit-app.s3.amazonaws.com/", {
        method: "HEAD"
      })
        .then(function (resp) {
          return !resp || !resp.ok;
        })
        .catch((_) => true)
        .then(setOffline);
    });
    return watch(setOffline);
  }, []);

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
    if (!db) return;
    void db.getArtists().then(async (artists) => {
      setArtists(artists);
      await db.reload();
      setArtists(await db.getArtists());
      setPendingDownload(await db.getDownloadSize());
    });
  }, [db]);

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

  const download = useCallback(() => {
    setDownloadProgress({ current: 0, total: pendingDownload });
    void db?.downloadSamples(async (current, total) => {
      if (current === total) {
        setDownloadProgress({ current: 0, total: 0 });
        setArtists(await db.getArtists());
        setPendingDownload(await db.getDownloadSize());
        return;
      }

      setDownloadProgress({ current, total });
    });
  }, [pendingDownload, db]);

  return (
    <PlayerContext.Provider value={playerState}>
      <div
        className={`${style.home} ${artistsByDate ? "" : style.homeLoading}`}
      >
        {!artistsByDate && <Loading />}
        {artistsByDate && (
          <Fragment>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between"
              }}
            >
              <h3>Sunspirit 2020</h3>
              <div>
                {offline && <NoSignal />}
                {!offline &&
                  pendingDownload > 0 &&
                  downloadProgress.total === 0 && (
                    <DownloadButton size={pendingDownload} onClick={download} />
                  )}
                {!offline && downloadProgress.total > 0 && (
                  <DownloadProgress
                    current={downloadProgress.current}
                    total={downloadProgress.total}
                  />
                )}
              </div>
            </div>

            {Object.keys(artistsByDate)
              .sort()
              .filter((d) => Boolean(d))
              .map((date) => (
                <Stage key={date} name={date} artists={artistsByDate[date]} />
              ))}
          </Fragment>
        )}
      </div>
    </PlayerContext.Provider>
  );
};

export default Music;
