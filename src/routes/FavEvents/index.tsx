import { FunctionalComponent, h, Fragment } from "preact";
import * as style from "./style.css";
import {
  useState,
  useEffect,
  useLayoutEffect,
  useContext,
  useCallback
} from "preact/hooks";
import Loading from "../../components/loading";
import { ArtistRecord } from "../../lib/types";
import { Db } from "../../lib/db";
import styled from "styled-components";
import { check, watch } from "is-offline";
import { NoSignal, StarIcon } from "../../components/icons";
import { DbContext } from "../../components/db-context";
import FavStar from "../../components/FavStar";

const Time = styled.div``;

const ArtistName = styled.div`
  flex: 1;
`;

type EventProps = {
  event: ArtistRecord;
  timeColumnWidth?: string;
};

const Event = ({ event, timeColumnWidth }: EventProps) => {
  const ctx = useContext(DbContext);
  return (
    <div className={style.musicEvent}>
      <Time style={{ width: timeColumnWidth ?? "60px" }}>
        {event.performanceTime}
      </Time>
      <ArtistName
        onClick={() =>
          ctx?.db.toggleFav(event?.storeName, event).then(ctx?.refresh)
        }
      >
        {event.name}{" "}
        {event.fav ? (
          <FavStar>
            <StarIcon />
          </FavStar>
        ) : (
          ""
        )}
      </ArtistName>
    </div>
  );
};

type DayProps = {
  name: string;
  events: ArtistRecord[];
  timeColumnWidth?: string;
};

const Day: FunctionalComponent<DayProps> = ({
  name,
  events,
  timeColumnWidth
}: DayProps) => {
  return (
    <div>
      <h3>{name}</h3>
      {events.map((a) => (
        <Event key={a.name} event={a} timeColumnWidth={timeColumnWidth} />
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

type FavEventsProps = Record<string, unknown>;

const FavEvents: FunctionalComponent<FavEventsProps> = () => {
  const [eventsByDate, setEventsByDate] = useState<{
    [stage: string]: ArtistRecord[];
  } | null>(null);
  const [db, setDb] = useState<Db | null>(null);
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

  const updateScreen = useCallback(() => {
    if (!db) return;
    (async () => {
      if (!db) return;
      const events: ArtistRecord[][] = await Promise.all(
        [
          "artists",
          "cinema",
          "theatre",
          "specificHealing",
          "popHealing",
          "musicHealing",
          "knowledge"
        ].map(async (storeName) => {
          const entries = await db.getAll(storeName);
          return entries.map((a) => ({
            ...a,
            storeName
          }));
        })
      );
      const favs = new Array<ArtistRecord>()
        .concat(...events)
        .filter((event) => event.fav);

      const eventsByDate: { [stage: string]: ArtistRecord[] } = {};

      favs.forEach((event) => {
        if (!eventsByDate[event.performanceDate]) {
          eventsByDate[event.performanceDate] = [];
        }

        eventsByDate[event.performanceDate].push(event);
      });

      Object.keys(eventsByDate).forEach((date) => {
        eventsByDate[date] = eventsByDate[date].sort((a, b) =>
          toDate(a.performanceTime) > toDate(b.performanceTime) ? 1 : -1
        );
      });

      setEventsByDate(eventsByDate);
    })();
  }, [db]);

  useEffect(() => {
    updateScreen();
  }, [updateScreen]);

  if (!db) return <Loading />;

  return (
    <DbContext.Provider value={{ db, refresh: updateScreen }}>
      <div className={`${style.home} ${eventsByDate ? "" : style.homeLoading}`}>
        {!eventsByDate && <Loading />}
        {eventsByDate && (
          <Fragment>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between"
              }}
            >
              <h3>Избранное</h3>
              <div>{offline && <NoSignal />}</div>
            </div>

            {Object.keys(eventsByDate)
              .sort()
              .filter((d) => Boolean(d))
              .map((date) => (
                <Day key={date} name={date} events={eventsByDate[date]} />
              ))}
            {Object.keys(eventsByDate).length === 0 && (
              <div>
                <p>Пока здесь ничего нет.</p>
                <p>
                  Кликайте на названия приглянувшихся вам ивентов, чтобы
                  добавить их в этот список.
                </p>
              </div>
            )}
          </Fragment>
        )}
      </div>
    </DbContext.Provider>
  );
};

export default FavEvents;
