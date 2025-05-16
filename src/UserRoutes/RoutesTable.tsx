import { useEffect, useState } from "react";
import { UserRoutesApi, Configuration, UserRoute } from "../api"; // Assuming SimpleUserRouteDto is the correct type
import RouteRow from "./RouteRow.tsx";
import tryRefreshToken from "../Utils/tokenRefresher.ts";
import getAccessToken from "../Utils/getAcessToken.ts";
import 'bootstrap/dist/css/bootstrap.min.css'; // Ensure Bootstrap CSS is imported

const RoutesTable = () => {
    const [simpleRoutes, setSimpleRoutes] = useState<UserRoute[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchRoutes = async () => {
            setIsLoading(true);
            setError(null);
            setSimpleRoutes([]);

            const config = new Configuration({
                accessToken: typeof getAccessToken === 'function' ? getAccessToken() : getAccessToken,
            });

            const routesApi = new UserRoutesApi(config);

            const attemptFetch = async () => routesApi.v1RoutesSimpleInfoGet();

            try {
                const routes = await attemptFetch();
                setSimpleRoutes(routes || []);
            } catch (err: any) {
                console.error("API Error fetching routes:", err);
                if (err.response && err.response.status === 401) {
                    try {
                        await tryRefreshToken(err);
                        const routes = await attemptFetch();
                        setSimpleRoutes(routes || []);
                    } catch (refreshErr: any) {
                        console.error("Error during token refresh or subsequent fetch:", refreshErr);
                        setError("Не удалось обновить сессию. Попробуйте перезагрузить страницу.");
                    }
                } else {
                    setError(`Не удалось загрузить маршруты: ${err.message || 'Неизвестная ошибка'}`);
                }
            } finally {
                setIsLoading(false);
            }
        };
        fetchRoutes();
    }, []);

    const handleDelete = (idToDelete: string) => {
        setSimpleRoutes((prevRoutes) =>
            prevRoutes.filter((route) => route.id !== idToDelete)
        );
    };

    if (isLoading) {
        return (
            <div className="d-flex justify-content-center align-items-center p-5">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Загрузка маршрутов...</span>
                </div>
                <span className="ms-3">Загрузка маршрутов...</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="alert alert-danger m-3" role="alert">
                <strong>Ошибка:</strong> {error}
            </div>
        );
    }

    if (simpleRoutes.length === 0) {
        return (
            <div className="alert alert-info text-center m-3" role="alert">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" className="bi bi-info-circle-fill me-2" viewBox="0 0 16 16">
                    <path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16zm.93-9.412-1 4.705c-.07.34.029.533.304.533.194 0 .487-.07.686-.246l-.088.416c-.287.346-.92.598-1.465.598-.703 0-1.002-.422-.808-1.319l.738-3.468c.064-.293.006-.399-.287-.47l-.451-.081.082-.381 2.29-.287zM8 5.5a1 1 0 1 1 0-2 1 1 0 0 1 0 2z"/>
                </svg>
                У вас пока нет сохраненных маршрутов.
                <br/>
                <small>Нажмите "Добавить маршрут", чтобы создать свой первый!</small>
            </div>
        );
    }

    return (
        <div className="table-responsive">
            <table className="table table-hover table-striped align-middle mb-0">
                <thead className="table-light">
                <tr>
                    <th scope="col" style={{ width: '5%' }} className="text-center">#</th>
                    <th scope="col" style={{ width: '50%' }}>Название</th>
                    <th scope="col" style={{ width: '20%' }} className="text-center"></th>
                    <th scope="col" style={{ width: '25%' }} className="text-center"></th>
                </tr>
                </thead>
                <tbody>
                {simpleRoutes.map((route, index) => (
                    <RouteRow
                        id={route.id!}
                        name={route.name as string}
                        index={index + 1}
                        key={route.id || index}
                        onDelete={handleDelete}
                    />
                ))}
                </tbody>
            </table>
        </div>
    );
};

export default RoutesTable;