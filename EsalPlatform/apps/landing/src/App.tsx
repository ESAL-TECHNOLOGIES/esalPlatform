import { Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
// import { DebugComponent } from "./debug-react";
// import { SimpleButton } from "./SimpleButton";

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
    </Routes>
  );
}

export default App;
