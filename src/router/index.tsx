import { createHashRouter } from "react-router-dom";
import Home from "@/pages/Home";
import WeekOne from "@/pages/WeekOne";
import WeekTwo from "@/pages/WeekTwo";

const router = createHashRouter([
    {
        path: "/",
        element: <Home />,
    },
    {
        path: "/week-01",
        element: <WeekOne />,
    },
    {
        path: "/week-02",
        element: <WeekTwo />,
    },
]);

export default router;
