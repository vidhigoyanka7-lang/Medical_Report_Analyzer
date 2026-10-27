import { Routes, Route, Navigate } from "react-router-dom";

import LoginPage        from "./pages/LoginPage";
import SignupPage       from "./pages/SignupPage";
import DashboardPage    from "./pages/DashboardPage";
import UploadReportPage from "./pages/UploadReportPage";
import AnalysisPage     from "./pages/AnalysisPage";
import ParameterPage    from "./pages/ParameterPage";
import ReportsPage      from "./pages/ReportsPage";
import CompareReportsPage from "./pages/CompareReportsPage";
import AssistantPage    from "./pages/AssistantPage";
import DoctorSummaryPage from "./pages/DoctorSummaryPage";
import ProfilePage      from "./pages/ProfilePage";
import NotFound         from "./pages/NotFound";

// Pages that need a logged-in user. Without a token we send the visitor to /login.
function RequireLogin({ children }) {
  return localStorage.getItem("token") ? children : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/"              element={<Navigate to="/login" replace />} />
      <Route path="/login"         element={<LoginPage />} />
      <Route path="/signup"        element={<SignupPage />} />
      <Route path="/dashboard"     element={<RequireLogin><DashboardPage /></RequireLogin>} />
      <Route path="/upload-report" element={<RequireLogin><UploadReportPage /></RequireLogin>} />
      <Route path="/analysis"      element={<RequireLogin><AnalysisPage /></RequireLogin>} />
      <Route path="/parameter/:id" element={<RequireLogin><ParameterPage /></RequireLogin>} />
      <Route path="/reports"       element={<RequireLogin><ReportsPage /></RequireLogin>} />
      <Route path="/compare"       element={<RequireLogin><CompareReportsPage /></RequireLogin>} />
      <Route path="/assistant"     element={<RequireLogin><AssistantPage /></RequireLogin>} />
      <Route path="/doctor-summary" element={<RequireLogin><DoctorSummaryPage /></RequireLogin>} />
      <Route path="/profile"       element={<RequireLogin><ProfilePage /></RequireLogin>} />
      <Route path="*"              element={<NotFound />} />
    </Routes>
  );
}