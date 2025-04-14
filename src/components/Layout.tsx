import { Outlet, useNavigate } from "react-router-dom"
import Footer from "./shared/Footer"
import Navbar from "./shared/Navbar"
import { AppDispatch } from "../redux/store";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import Cookies from "js-cookie";
import { setUser } from "../redux/slice/authSlice";
import { ConfigProvider, Spin, Layout as Layouts, theme } from "antd";
import { GetCurrentUser } from "../services/authAPI";
const Layout = () => {

    const lightTheme = {
        algorithm: theme.defaultAlgorithm,
        token: {
            borderRadius: 16,
            fontFamily: "Rubik, sans-serif",
            colorPrimary: '#46cb4c',
            colorPrimaryBg: "#46cb4c",
            colorBgLayout: "White",
        },
    };
    const darkTheme = {
        algorithm: theme.darkAlgorithm,
        token: {
            borderRadius: 16,
            fontFamily: "Rubik, sans-serif",
            colorBgLayout: "black",
            colorPrimaryBg: "black",
        },
    }


    const navigate = useNavigate();
    const dispatch = useDispatch<AppDispatch>();
    const [loading, setLoading] = useState(false);
    const [currentTheme, setCurrentTheme] = useState<"light" | "dark">("light")

    const token = Cookies.get("Shreeji_Veg");
    useEffect(() => {
        const fetchData = async () => {
            if (!token) {
                navigate("/login");
                return;
            }
            try {
                setLoading(true);
                const userInfo = await GetCurrentUser();
                dispatch(setUser(userInfo.data));
            } catch (error) {
                console.error("Invalid token:", error);
                navigate("/login");
            }
        };
        fetchData();
        setLoading(false);
    }, [navigate, dispatch, token]);

    if (loading) {
        return <Spin />
    }

    const toggleTheme = () => {
        setCurrentTheme(prevTheme => (prevTheme === "light" ? "dark" : "light"));
    };


    return (
        <>
            <ConfigProvider
                theme={currentTheme === "light" ? lightTheme : darkTheme}
            >
                <Layouts >
                    <div className="min-h-screen flex flex-col">
                        <Navbar onToggleTheme={toggleTheme} currentTheme={currentTheme} />
                        <div className="flex-grow">
                            <Outlet />
                        </div>
                        <Footer />
                    </div>
                </Layouts>
            </ConfigProvider>
        </>
    )
}

export default Layout
