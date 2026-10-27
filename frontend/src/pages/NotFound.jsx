import { Link } from "react-router-dom";
import { Icon } from "../components/ui";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-canvas flex items-center justify-center p-4 animate-fadeIn">
      <div className="text-center max-w-md">
        <span className="mx-auto mb-6 grid h-20 w-20 place-items-center rounded-3xl bg-gradient-to-br from-royal to-violet text-white shadow-lg shadow-violet/30">
          <Icon n="alert" className="h-10 w-10" aria-hidden="true" />
        </span>
        <h1 className="text-6xl font-extrabold text-navy mb-2">404</h1>
        <h2 className="text-xl font-bold text-slate-600 mb-3">Page Not Found</h2>
        <p className="text-sm text-slate-500 mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link to="/dashboard" className="btn-primary">
          <Icon n="home" className="h-4 w-4" />Go to Dashboard
        </Link>
      </div>
    </div>
  );
}
