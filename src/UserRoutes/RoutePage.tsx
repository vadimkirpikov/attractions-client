import {useNavigate, useParams} from "react-router-dom";
import {useEffect, useState} from "react";
import {Configuration, UserRoute, UserRoutesApi} from "../api";
import getAccessToken from "../Utils/getAcessToken.ts";
import tryRefreshToken from "../Utils/tokenRefresher.ts";
import {useSelector} from "react-redux";
import {RootState} from "../state/authSlice.ts";
import PlaceList from "../Places/PlaceList.tsx";

const RoutePage = () => {
    const { id } = useParams();
    const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
    const navigate = useNavigate();
    const [route, setRoute] = useState<UserRoute>();
    useEffect(() => {
        if (!isAuthenticated) {
            navigate("/login")
        }
        const fetchRouteFullInfo = async () => {
            if (id) {
                const config = new Configuration({
                    accessToken: getAccessToken,
                });
                const routesApi = new UserRoutesApi(config);
                try {
                    const routeFullInfo = await routesApi.v1RoutesFullInfoIdGet({ id });
                    setRoute(routeFullInfo);
                    console.log(routeFullInfo);
                } catch (error: any) {
                    if (error.response && error.response.status === 401) {
                        await tryRefreshToken(error);
                        const routeFullInfo = await routesApi.v1RoutesFullInfoIdGet({ id });
                        setRoute(routeFullInfo);
                    }
                    else {
                        navigate("/login")
                    }
                }
            } else {
                console.error("Route ID is undefined");
            }
        };
        fetchRouteFullInfo();
    }, [id])

    if (!route) {
        return (<div>Загрузка ...</div>)
    }
    return (
        <>
            <div>
                Маршрут имя {route?.name} id {route.id}
            </div>
            <PlaceList isPreview={false} />
        </>
    )
}
export default RoutePage;