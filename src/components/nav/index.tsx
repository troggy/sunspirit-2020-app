import { FunctionalComponent, h } from "preact";
import { Link } from "preact-router/match";
import { GiMusicalNotes, GiCampfire, GiPathDistance } from "react-icons/gi";
import * as style from "./style.css";

const Nav: FunctionalComponent = () => {
  return (
    <nav class={style.nav}>
      <Link activeClassName={style.active} href="/">
        <GiMusicalNotes />
      </Link>
      <Link activeClassName={style.active} href="/activities">
        <GiCampfire />
      </Link>
      <Link activeClassName={style.active} href="/map">
        <GiPathDistance />
      </Link>
    </nav>
  );
};

export default Nav;
