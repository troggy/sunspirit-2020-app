import { FunctionalComponent, h } from "preact";
import { Route, Router } from "preact-router";

import Music from "../routes/music";
import NotFoundPage from "../routes/notfound";
import Nav from "./nav";
import EventPage from "../routes/EventPage";

if ((module as any).hot) {
  // eslint-disable-next-line import/no-unassigned-import
  require("preact/debug");
}

const App: FunctionalComponent = () => {
  return (
    <div id="app">
      <Router>
        <Route path="/" component={Music} />
        <Route
          path="/cinema"
          component={() => <EventPage storeName="cinema" />}
        />
        <Route
          path="/knowledge"
          component={() => (
            <EventPage storeName="knowledge" timeColumnWidth="120px" />
          )}
        />
        <Route
          path="/theatre"
          component={() => <EventPage storeName="theatre" />}
        />
        <Route
          path="/specificHealing"
          component={() => (
            <EventPage storeName="specificHealing" timeColumnWidth="120px" />
          )}
        />
        <Route
          path="/popHealing"
          component={() => (
            <EventPage storeName="popHealing" timeColumnWidth="120px" />
          )}
        />
        <Route
          path="/musicHealing"
          component={() => (
            <EventPage storeName="musicHealing" timeColumnWidth="120px" />
          )}
        />
        <NotFoundPage default />
      </Router>
      <Nav />
    </div>
  );
};

export default App;
