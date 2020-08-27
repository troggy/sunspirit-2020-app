import { FunctionalComponent, h } from "preact";
import * as style from "./style.css";
import { useState, useEffect } from "preact/hooks";
import { CgVinyl } from 'react-icons/cg';

const Tabletop = require('tabletop');

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
  artists: any[];
};

const Stage: FunctionalComponent<StageProps> = ({ name, artists }) => {
  return (
    <div>
      <h3>{name}</h3>
      {artists.map(a => <div>{a.name}</div>)}
    </div>
  )
};

const Music: FunctionalComponent = () => {
  const [data, setData] = useState<{ [stage: string]: Artist[] } | null>(null);

  useEffect(() => {
    Tabletop.init({
      key: 'https://docs.google.com/spreadsheets/d/1fGLxOfXsMIIbz0KKjM6bj9ChBb1dMQTY9KxiVDOR8JI/edit?usp=sharing'
    }
    ).then(function (data: any, tabletop: any) {
      const artists = data["Музыка"].all();
      setData(artists.reduce((stages: any, artist: any) => ({
        [artist.stage]: [...(stages[artist.stage] || []), artist]
      }), {}));
    })
  }, []);

  return (
    <div class={style.home}>
      {!data && <div class={style.loader}>
        <CgVinyl />
      </div>}
      {data && Object.entries(data).map(([name, artists]) => 
          <Stage name={name} artists={artists} />
      )}
    </div>
  );
};

export default Music;
