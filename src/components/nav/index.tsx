import { FunctionalComponent, h, Fragment } from "preact";
import { Link } from "preact-router/match";
import * as style from "./style.css";
import { useState, useCallback } from "preact/hooks";
import { ChevronDown } from "../icons";

export const routes: { [name: string]: string } = {
  "/": "Музыка",
  "/cinema": "Кино",
  "/knowledge": "Знания",
  "/theatre": "Театральное искусство",
  "/specificHealing": "Specific Healing",
  "/popHealing": "Popular Healing",
  "/musicHealing": "Music Healing",
  "/fav": "⭐ Избранное"
};

const Pane = ({ close }: { close: (name: string) => void }) => {
  return (
    <div
      style={{
        lineHeight: "45px",
        background: "black",
        fontSize: "30px",
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center"
      }}
    >
      {Object.keys(routes).map((route) => (
        <Link
          key={route}
          style={{
            width: "100%",
            textAlign: "center"
          }}
          href={route}
          onClick={() => close(routes[route])}
        >
          {routes[route]}
        </Link>
      ))}
    </div>
  );
};

let defaultPage = "/";
if (typeof window !== "undefined") {
  defaultPage = window.location.pathname;
}

const Nav: FunctionalComponent = () => {
  const [menu, setMenu] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<string>(routes[defaultPage]);

  const onNav = useCallback((name: string) => {
    setMenu(false);
    setCurrentPage(name);
  }, []);

  return (
    <Fragment>
      {menu && <Pane close={onNav} />}
      <nav className={style.nav} onClick={() => setMenu(!menu)}>
        {currentPage}{" "}
        <span style={{ paddingTop: "9px" }}>
          <ChevronDown />
        </span>
      </nav>
    </Fragment>
  );
};

export default Nav;
