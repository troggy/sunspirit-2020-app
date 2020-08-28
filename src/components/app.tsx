import { FunctionalComponent, h } from "preact";
import { Route, Router } from "preact-router";

import Music from "../routes/music";
import NotFoundPage from "../routes/notfound";

if ((module as any).hot) {
  // eslint-disable-next-line import/no-unassigned-import
  require("preact/debug");
}

const App: FunctionalComponent = () => {
  return (
    <div id="app">
      <Router>
        <Route path="/" component={Music} />
        <NotFoundPage default />
      </Router>
    </div>
  );
};

export default App;
