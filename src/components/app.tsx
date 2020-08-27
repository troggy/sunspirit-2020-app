import { FunctionalComponent, h } from "preact";
import { Route, Router, RouterOnChangeArgs } from "preact-router";

import Music from "../routes/music";
import Activities from "../routes/activities";
import Map from "../routes/map";
import NotFoundPage from "../routes/notfound";
import Nav from "./nav";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
if ((module as any).hot) {
  // tslint:disable-next-line:no-var-requires
  require("preact/debug");
}

const App: FunctionalComponent = () => {
  let currentUrl: string;
  const handleRoute = (e: RouterOnChangeArgs) => {
    currentUrl = e.url;
  };

  return (
    <div id="app">
      <Nav />
      <Router onChange={handleRoute}>
        <Route path="/" component={Music} />
        <Route path="/activities/" component={Activities} />
        <Route path="/map" component={Map} />
        <NotFoundPage default />
      </Router>
    </div>
  );
};

export default App;
