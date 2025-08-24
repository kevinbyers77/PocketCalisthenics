import { Outlet, Link } from "react-router-dom";

export default function App() {
  return (
    <div style={{ padding: "1rem", fontFamily: "sans-serif" }}>
      <h1>Pocket Calisthenics</h1>
      <nav>
        <Link to="/">Home</Link>
      </nav>
      <Outlet />
    </div>
  );
}
