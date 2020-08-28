import { FunctionalComponent, h } from "preact";
import { Link } from "preact-router/match";
import * as style from "./style.css";

const Nav: FunctionalComponent = () => {
  return (
    <nav className={style.nav}>
      <Link activeClassName={style.active} href="/">
        Музыка
      </Link>
      <Link activeClassName={style.active} href="/activities">
        Активности
      </Link>
    </nav>
  );
};

export default Nav;
