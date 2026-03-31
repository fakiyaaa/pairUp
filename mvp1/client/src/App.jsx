import { Navigate, Route, Routes } from "react-router-dom";
import Onboarding from "./pages/Onboarding";
import Browse from "./pages/Browse";

function App() {
  const userId = localStorage.getItem("user_id");

  return (
    <Routes>
      <Route
        path="/"
        element={<Navigate to={userId ? "/browse" : "/onboarding"} replace />}
      />
      <Route path="/onboarding" element={<Onboarding />} />
      <Route path="/browse" element={<Browse />} />
    </Routes>
  );
}

export default App;
