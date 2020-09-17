import { FunctionalComponent, h, Fragment } from "preact";
import * as style from "./style.css";
import { useState, useEffect, useLayoutEffect } from "preact/hooks";
import Loading from "../../components/loading";
import { ArtistRecord } from "../../lib/types";
import { Db } from "../../lib/db";
import styled from "styled-components";
import { check, watch } from "is-offline";
import { NoSignal } from "../../components/icons";
import { routes } from "../../components/nav";

const Time = styled.div``;

const ArtistName = styled.div`
  flex: 1;
`;

type EventProps = {
  event: ArtistRecord;
  timeColumnWidth?: string;
};

const Event = ({ event, timeColumnWidth }: EventProps) => {
  return (
    <div className={style.musicEvent}>
      <Time style={{ width: timeColumnWidth ?? "50px" }}>
        {event.performanceTime}
      </Time>
      <ArtistName>{event.name}</ArtistName>
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

type EventPageProps = {
  storeName: string;
  timeColumnWidth?: string;
};

const EventPage: FunctionalComponent<EventPageProps> = ({
  storeName,
  timeColumnWidth
}: EventPageProps) => {
  const [eventsByDate, setEventsByDate] = useState<{
    [stage: string]: ArtistRecord[];
  } | null>(null);
  const [events, setEvents] = useState<ArtistRecord[]>([]);
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

  useEffect(() => {
    if (!db) return;
    void db.getAll(storeName).then(async (events) => {
      setEvents(events);
      await db.reload(storeName);
      setEvents(await db.getAll(storeName));
    });
  }, [storeName, db]);

  useEffect(() => {
    if (!events || events.length === 0) return;

    const eventsByDate: { [stage: string]: ArtistRecord[] } = {};

    events.forEach((event) => {
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
  }, [events]);

  return (
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
            <h3>{routes["/" + storeName]}</h3>
            <div>{offline && <NoSignal />}</div>
          </div>

          {Object.keys(eventsByDate)
            .sort()
            .filter((d) => Boolean(d))
            .map((date) => (
              <Day
                key={date}
                name={date}
                events={eventsByDate[date]}
                timeColumnWidth={timeColumnWidth}
              />
            ))}
        </Fragment>
      )}
    </div>
  );
};

export default EventPage;
