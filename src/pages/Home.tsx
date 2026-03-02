import { Link } from "react-router-dom";

export default function Home() {
  return (
    <ul>
      <li>
        <Link to="/">Home</Link>
      </li>
      <li>
        <Link to="/week-01">Week 1</Link>
      </li>
      <li>
        <Link to="/week-02">Week 2</Link>
      </li>
      <li>
        <Link to="/week-03">Week 3</Link>
      </li>
    </ul>
  );
}
