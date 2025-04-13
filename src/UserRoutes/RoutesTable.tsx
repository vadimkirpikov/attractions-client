import { useEffect, useState } from "react";
import {UserRoutesApi, Configuration} from "../api";
import RouteRow from "./RouteRow.tsx";
import tryRefreshToken from "../Utils/tokenRefresher.ts";
import getAccessToken from "../Utils/getAcessToken.ts"; // Путь к вашему API

const RoutesTable = () => {
    const [simpleRoutes, setSimpleRoutes] = useState<any>([]);
    useEffect(() => {
        const fetchRoutes = async () => {
            const config = new Configuration({
                accessToken: getAccessToken,
            });

            const routesApi = new UserRoutesApi(config);
            try {
                const routes = await routesApi.v1RoutesSimpleInfoGet();
                setSimpleRoutes(routes);
            } catch (error: any) {
                console.error(error);
                if (error.response && error.response.status === 401) {
                    await tryRefreshToken(error);
                    const routes = await routesApi.v1RoutesSimpleInfoGet();
                    setSimpleRoutes(routes);
                }
            }
        };
        fetchRoutes();
    }, []);

    const handleDelete = (id: string) => {
        setSimpleRoutes((prev: any[]) =>
            prev.filter((item) => item.id !== id)
        );
    };

    return (
        <div>
            <h1>Маршруты</h1>
            <table className="table table-dark table-striped">
                <thead>
                <tr>
                    <th scope="col">#</th>
                    <th scope="col">Name</th>
                    <th scope="col">Delete</th>
                    <th scope="col">Check</th>
                </tr>
                </thead>
                <tbody>
                {simpleRoutes.map((route: any, index: number) => (
                    <RouteRow id={route.id} name={route.name} index={index + 1} key={index} onDelete={handleDelete} />
                ))}</tbody>

            </table>
        </div>
)
};

export default RoutesTable;
