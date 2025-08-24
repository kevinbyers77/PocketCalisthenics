import { Routes, Route, Link } from "react-router-dom";
import Home from "./routes/Home";
import Day from "./routes/Day";
import Timer from "./routes/Timer";
import InstallPWA from "./components/InstallPWA";
import IOSInstallHint from "./components/IOSInstallHint";

export default function App() {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      {/* Sticky app bar */}
      <header className="sticky top-0 z-40 bg-brand text-white shadow-md">
        <div className="mx-auto flex max-w-screen-md items-center justify-between px-4 py-3">
          <h1 className="text-lg font-semibold tracking-tight md:text-xl">
            <Link to="/" className="no-underline text-white hover:opacity-90">
              Pocket Calisthenics
            </Link>
          </h1>
          <nav>
            <Link
              to="/"
              className="text-white/90 hover:text-white underline-offset-4 hover:underline"
            >
              Home
            </Link>
          </nav>
        </div>
      </header>

      {/* Install banners (Android/Chrome + iOS hint) */}
      <InstallPWA />
      <IOSInstallHint />

      {/* Main content */}
      <main className="mx-auto max-w-screen-md px-4 py-4 md:px-6 md:py-6">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/day/:week/:dayIndex" element={<Day />} />
          <Route path="/timer/:week/:dayIndex" element={<Timer />} />
        </Routes>
      </main>
    </div>
  );
}
