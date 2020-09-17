import { FunctionalComponent, h } from "preact";
import { Link } from "preact-router/match";
import * as style from "./style.css";

const Nav: FunctionalComponent = () => {
  return (
    <nav className={style.nav}>
      <Link activeClassName={style.active} href="/">
        Музыка
      </Link>
      <Link activeClassName={style.active} href="/cinema">
        Кино
      </Link>
      <Link activeClassName={style.active} href="/knowledge">
        Знания
      </Link>
    </nav>
  );
};

export default Nav;
