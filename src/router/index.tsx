import { createHashRouter } from "react-router-dom";
import Home from "@/pages/Home";
import WeekOne from "@/pages/WeekOne";

const router = createHashRouter([
    {
        path: "/",
        element: <Home />,
    },
    {
        path: "/week-01",
        element: <WeekOne />,
    },
]);

export default router;
