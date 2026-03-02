import { createHashRouter } from "react-router-dom";
import Home from "@/pages/Home";
import WeekOne from "@/pages/WeekOne";
import WeekTwo from "@/pages/WeekTwo";
import WeekThree from "@/pages/WeekThree";

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
    {
        path: "/week-03",
        element: <WeekThree />,
    },
]);

export default router;
