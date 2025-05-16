import {useNavigate, useParams} from "react-router-dom";
import {useEffect, useState} from "react";
import {Configuration, RoutePlaceDto, UserRouteDto, UserRouteDtoReq, UserRoutesApi} from "../api";
import getAccessToken from "../Utils/getAcessToken.ts";
import tryRefreshToken from "../Utils/tokenRefresher.ts";
import {useSelector} from "react-redux";
import {RootState} from "../state/authSlice.ts";
import RouteEditorForm, {DisplayRoutePlace, PlaceAdditionInfo} from "./EditorForm.tsx";
import 'bootstrap/dist/css/bootstrap.min.css';

const RoutePage = () => {
    const {id: routeId} = useParams<{ id: string }>();
    const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
    const navigate = useNavigate();
    const [editableRoute, setEditableRoute] = useState<{
        name: string;
        routePlaces: DisplayRoutePlace[];
    } | null>(null);
    const [exceptedIds, setExceptedIds] = useState<string[]>([]);
    const [message, setMessage] = useState<string | null>(null);
    const [isError, setIsError] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    useEffect(() => {
        if (!isAuthenticated) {
            navigate("/login");
        }
    }, [isAuthenticated, navigate]);
    useEffect(() => {
        if (!routeId || !isAuthenticated) {
            if (!routeId) setIsLoading(false);
            return;
        }
        const fetchRouteFullInfo = async () => {
            setIsLoading(true);
            setMessage("Загрузка маршрута...");
            setIsError(false);
            const config = new Configuration({accessToken: typeof getAccessToken === 'function' ? getAccessToken() : getAccessToken});
            const routesApi = new UserRoutesApi(config);
            const processFetchedData = (fetchedRouteFullInfo: UserRouteDto) => {
                const sortedApiRoutePlaces = (fetchedRouteFullInfo.routePlaces ?? [])
                    .sort((a, b) => (a.placePosition ?? 0) - (b.placePosition ?? 0));
                const displayRoutePlaces: DisplayRoutePlace[] = sortedApiRoutePlaces.map(rp => ({
                    ...rp,
                    placeId: rp.placeId!,
                    placePosition: rp.placePosition!,
                    cost: (rp as any).cost ?? 0,
                    latitude: (rp as any).latitude,
                    longitude: (rp as any).longitude,
                }));
                setEditableRoute({
                    name: fetchedRouteFullInfo.name ?? '',
                    routePlaces: displayRoutePlaces
                });
                setExceptedIds(displayRoutePlaces.map(rp => rp.placeId as string));
                setMessage(null);
            };
            try {
                const routeFullInfo = await routesApi.v1RoutesFullInfoIdGet({id: routeId});
                processFetchedData(routeFullInfo);
            } catch (error: any) {
                console.error(error);
                if (error.response && error.response.status === 401) {
                    try {
                        await tryRefreshToken(error);
                        const refreshedRouteFullInfo = await routesApi.v1RoutesFullInfoIdGet({id: routeId});
                        processFetchedData(refreshedRouteFullInfo);
                    } catch (refreshError: any) {
                        console.error("Failed to refresh token and fetch route", refreshError);
                        setMessage("Не удалось обновить токен и загрузить маршрут. Пожалуйста, войдите снова.");
                        setIsError(true);
                    }
                } else {
                    setMessage(`Ошибка при загрузке маршрута: ${error.message || 'Неизвестная ошибка'}`);
                    setIsError(true);
                }
            } finally {
                setIsLoading(false);
            }
        };
        fetchRouteFullInfo();
    }, [routeId, isAuthenticated, navigate]);
    useEffect(() => {
        if (message && (message.includes("успешно обновлен") || message.includes("Произошла ошибка при сохранении"))) {
            const timeout = setTimeout(() => {
                setMessage(null);
                if (message.includes("успешно обновлен") && !isError) {
                }
            }, 3000);
            return () => clearTimeout(timeout);
        }
    }, [message, isError]);
    const handleRouteNameChange = (name: string) => {
        setEditableRoute(prev => prev ? {...prev, name} : null);
    };
    const handleAddPlaceToRoute = (placeInfo: PlaceAdditionInfo) => {
        if (!editableRoute) return;
        setExceptedIds(prev => [...prev, placeInfo.id]);
        const currentPlaces = editableRoute.routePlaces ?? [];
        const newPlacePosition = currentPlaces.length > 0
            ? Math.max(...currentPlaces.map(p => p.placePosition ?? 0)) + 1
            : 0;
        const newPlace: DisplayRoutePlace = {
            placeId: placeInfo.id, placeName: placeInfo.name, cost: placeInfo.cost,
            placePosition: newPlacePosition, latitude: placeInfo.latitude, longitude: placeInfo.longitude,
        };
        setEditableRoute(prev => prev ? {
            ...prev,
            routePlaces: [...prev.routePlaces, newPlace].sort((a, b) => (a.placePosition ?? 0) - (b.placePosition ?? 0))
        } : null);
        setMessage(`Место "${placeInfo.name}" добавлено (временно). Сохраните изменения.`);
        setIsError(false);
    };
    const handleRemovePlaceFromRoute = (placeIdToRemove: string) => {
        if (!editableRoute) return;
        setEditableRoute(prev => prev ? {
            ...prev,
            routePlaces: prev.routePlaces
                .filter(rp => rp.placeId !== placeIdToRemove)
                .map((rp, index) => ({...rp, placePosition: index}))
                .sort((a, b) => (a.placePosition ?? 0) - (b.placePosition ?? 0))
        } : null);
        setExceptedIds(prev => prev.filter(id => id !== placeIdToRemove));
        setMessage(`Место удалено (временно). Сохраните изменения.`);
        setIsError(false);
    };
    const handleUpdateRoute = async () => {
        if (!editableRoute || !routeId) {
            setMessage("Данные маршрута отсутствуют.");
            setIsError(true);
            return;
        }
        if (!editableRoute.name.trim()) {
            setMessage("Название маршрута не может быть пустым.");
            setIsError(true);
            return;
        }
        setIsSubmitting(true);
        setMessage("Сохранение маршрута...");
        setIsError(false);
        const config = new Configuration({accessToken: typeof getAccessToken === 'function' ? getAccessToken() : getAccessToken});
        const routesApi = new UserRoutesApi(config);
        const routePlacesForApi: RoutePlaceDto[] = editableRoute.routePlaces.map(rp => ({
            placeId: rp.placeId,
            placePosition: rp.placePosition,
            placeName: rp.placeName,
        }));
        const routeDtoToSend: UserRouteDtoReq = {
            name: editableRoute.name,
            routePlaces: routePlacesForApi
        };
        try {
            await routesApi.v1RoutesIdPut({id: routeId, userRouteDtoReq: routeDtoToSend});
            setMessage("Маршрут успешно обновлен!");
            setIsError(false);
        } catch (error: any) {
            console.error(error);
            if (error.response && error.response.status === 401) {
                try {
                    await tryRefreshToken(error);
                    await routesApi.v1RoutesIdPut({id: routeId, userRouteDtoReq: routeDtoToSend});
                    setMessage("Маршрут успешно обновлен после обновления токена!");
                    setIsError(false);
                } catch (refreshError: any) {
                    console.error("Failed to refresh token and save route", refreshError);
                    setMessage("Не удалось обновить токен и сохранить маршрут. Пожалуйста, войдите снова.");
                    setIsError(true);
                }
            } else {
                setMessage(`Произошла ошибка при сохранении маршрута: ${error.message || 'Неизвестная ошибка'}`);
                setIsError(true);
            }
        } finally {
            setIsSubmitting(false);
        }
    };
    if (!isAuthenticated) return null;
    if (isLoading) {
        return (
            <div className="container mt-4">
                <div className="alert alert-info text-center d-flex align-items-center justify-content-center"
                     role="alert">
                    <div className="spinner-border spinner-border-sm me-2" role="status">
                        <span className="visually-hidden">Загрузка...</span>
                    </div>
                    {message || "Загрузка маршрута..."}
                </div>
            </div>
        );
    }
    if (!editableRoute && !isLoading) {
        return (
            <div className="container mt-4">
                <div className={`alert ${isError ? 'alert-danger' : 'alert-warning'}`} role="alert">
                    {message || "Не удалось загрузить данные маршрута."}
                </div>
                <button className="btn btn-secondary mt-2" onClick={() => navigate("/dashboard")}>К моим маршрутам
                </button>
            </div>
        );
    }
    return (
        <div className="container mt-4 mb-5">
            <div className="d-flex justify-content-between align-items-center pb-3 mb-4 border-bottom">
                <h1 className="h2 mb-0">Редактирование маршрута</h1>
                <button className="btn btn-outline-secondary" onClick={() => navigate("/dashboard")}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor"
                         className="bi bi-arrow-left-circle me-1" viewBox="0 0 16 16">
                        <path fillRule="evenodd"
                              d="M1 8a7 7 0 1 0 14 0A7 7 0 0 0 1 8zm15 0A8 8 0 1 1 0 8a8 8 0 0 1 16 0zm-4.5-.5a.5.5 0 0 1 0 1H5.707l2.147 2.146a.5.5 0 0 1-.708.708l-3-3a.5.5 0 0 1 0-.708l3-3a.5.5 0 1 1 .708.708L5.707 7.5H11.5z"/>
                    </svg>
                    К моим маршрутам
                </button>
            </div>
            {editableRoute && (
                <RouteEditorForm
                    routeName={editableRoute.name}
                    onRouteNameChange={handleRouteNameChange}
                    routePlaces={editableRoute.routePlaces}
                    onAddPlace={handleAddPlaceToRoute}
                    onRemovePlace={handleRemovePlaceFromRoute}
                    exceptedIds={exceptedIds}
                >
                    <div className="d-flex justify-content-start gap-2 mt-3">
                        <button
                            type="button"
                            className="btn btn-primary btn-lg"
                            onClick={handleUpdateRoute}
                            disabled={isSubmitting || !editableRoute.name.trim()}
                        >
                            {isSubmitting ? (
                                <>
                                    <span className="spinner-border spinner-border-sm me-2" role="status"
                                          aria-hidden="true"></span>
                                    Сохранение...
                                </>
                            ) : (
                                <>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor"
                                         className="bi bi-save me-1" viewBox="0 0 16 16">
                                        <path
                                            d="M2 1a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H9.5a1 1 0 0 0-1 1v7.293l2.646-2.647a.5.5 0 0 1 .708.708l-3.5 3.5a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L7.5 9.293V2a2 2 0 0 1 2-2H14a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V2a2 2 0 0 1 2-2h2.5a.5.5 0 0 1 0 1H2z"/>
                                    </svg>
                                    Сохранить изменения
                                </>
                            )}
                        </button>
                    </div>
                    {message && !message.toLowerCase().includes("загрузка") && (
                        <div className={`alert ${isError ? 'alert-danger' : 'alert-success'} mt-3`} role="alert">
                            {message}
                        </div>
                    )}
                </RouteEditorForm>
            )}
        </div>
    );
}
export default RoutePage;