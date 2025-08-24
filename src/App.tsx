import { Routes, Route, Link } from "react-router-dom";
import Home from "./routes/Home";
import Day from "./routes/Day";
import Timer from "./routes/Timer";

export default function App() {
  return (
    <div style={{ fontFamily: "system-ui, sans-serif", padding: 16, maxWidth: 720, margin: "0 auto" }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <h1 style={{ fontSize: 24, margin: 0 }}>
          <Link to="/" style={{ textDecoration: "none" }}>Pocket Calisthenics</Link>
        </h1>
        <nav><Link to="/" style={{ textDecoration: "none" }}>Home</Link></nav>
      </header>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/day/:week/:dayIndex" element={<Day />} />
        <Route path="/timer/:week/:dayIndex" element={<Timer />} />
      </Routes>
    </div>
  );
}
