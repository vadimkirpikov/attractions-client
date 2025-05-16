// src/Routes/CreateRoutePage.tsx
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Configuration, RoutePlaceDto, UserRouteDtoReq, UserRoutesApi } from "../api";
import getAccessToken from "../Utils/getAcessToken.ts";
import tryRefreshToken from "../Utils/tokenRefresher.ts";
import { useSelector } from "react-redux";
import { RootState } from "../state/authSlice.ts";
import RouteEditorForm, { DisplayRoutePlace, PlaceAdditionInfo } from "./EditorForm.tsx";
import 'bootstrap/dist/css/bootstrap.min.css';


const CreateRoutePage = () => {
    const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
    const navigate = useNavigate();

    const [routeName, setRouteName] = useState<string>('');
    const [routePlaces, setRoutePlaces] = useState<DisplayRoutePlace[]>([]);
    const [exceptedIds, setExceptedIds] = useState<string[]>([]);

    const [message, setMessage] = useState<string | null>(null);
    const [isError, setIsError] = useState<boolean>(false);
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);


    useEffect(() => {
        if (!isAuthenticated) {
            navigate("/login");
        }
    }, [isAuthenticated, navigate]);

    useEffect(() => {
        if (message) {
            const timeout = setTimeout(() => {
                setMessage(null);
                if (!isError && message.includes("успешно создан")) {
                    navigate("/dashboard");
                }
            }, 3000);
            return () => clearTimeout(timeout);
        }
    }, [message, isError, navigate]);

    const handleAddPlaceToRoute = (placeInfo: PlaceAdditionInfo) => {
        setExceptedIds(prev => [...prev, placeInfo.id]);
        const newPlacePosition = routePlaces.length > 0
            ? Math.max(...routePlaces.map(p => p.placePosition ?? 0)) + 1
            : 0;
        const newPlace: DisplayRoutePlace = {
            placeId: placeInfo.id,
            placeName: placeInfo.name,
            cost: placeInfo.cost,
            placePosition: newPlacePosition,
            latitude: placeInfo.latitude,
            longitude: placeInfo.longitude,
        };
        setRoutePlaces(prev => [...prev, newPlace].sort((a,b) => (a.placePosition ?? 0) - (b.placePosition ?? 0)));
        setMessage(`Место "${placeInfo.name}" добавлено (временно).`);
        setIsError(false);
    };

    const handleRemovePlaceFromRoute = (placeIdToRemove: string) => {
        setRoutePlaces(prev => prev
            .filter(rp => rp.placeId !== placeIdToRemove)
            .map((rp, index) => ({ ...rp, placePosition: index }))
            .sort((a,b) => (a.placePosition ?? 0) - (b.placePosition ?? 0))
        );
        setExceptedIds(prev => prev.filter(id => id !== placeIdToRemove));
        setMessage(`Место удалено (временно).`);
        setIsError(false);
    };

    const handleCreateRoute = async () => {
        if (!routeName.trim()) {
            setMessage("Пожалуйста, введите название маршрута.");
            setIsError(true);
            return;
        }

        setIsSubmitting(true);
        setMessage("Создание маршрута...");
        setIsError(false);

        const config = new Configuration({
            accessToken: typeof getAccessToken === 'function' ? getAccessToken() : getAccessToken,
        });
        const routesApi = new UserRoutesApi(config);

        const routePlacesForApi: RoutePlaceDto[] = routePlaces.map(rp => ({
            placeId: rp.placeId,
            placePosition: rp.placePosition,
            placeName: rp.placeName,
        }));

        const routeToCreate: UserRouteDtoReq = {
            name: routeName,
            routePlaces: routePlacesForApi,
        };

        try {
            await routesApi.v1RoutesPost({ userRouteDtoReq: routeToCreate });
            setMessage("Маршрут успешно создан! Вы будете перенаправлены.");
            setIsError(false);
        } catch (error: any) {
            console.error("Error creating route:", error);
            if (error.response && error.response.status === 401) {
                try {
                    await tryRefreshToken(error);
                    await routesApi.v1RoutesPost({ userRouteDtoReq: routeToCreate });
                    setMessage("Маршрут успешно создан после обновления токена! Вы будете перенаправлены.");
                    setIsError(false);
                } catch (refreshError: any) {
                    setMessage("Ошибка при обновлении токена. Не удалось создать маршрут.");
                    setIsError(true);
                    console.error("Error refreshing token during create:", refreshError);
                }
            } else {
                setMessage(`Произошла ошибка при создании маршрута: ${error.message || 'Неизвестная ошибка'}`);
                setIsError(true);
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isAuthenticated) return null;

    return (
        <div className="container mt-4 mb-5">
            <div className="pb-3 mb-4 border-bottom">
                <h1 className="h2">Создание нового маршрута</h1>
            </div>

            <RouteEditorForm
                routeName={routeName}
                onRouteNameChange={setRouteName}
                routePlaces={routePlaces}
                onAddPlace={handleAddPlaceToRoute}
                onRemovePlace={handleRemovePlaceFromRoute}
                exceptedIds={exceptedIds}
            >
                
                <div className="d-flex justify-content-start gap-2 mt-3">
                    <button
                        type="button"
                        className="btn btn-primary btn-lg"
                        onClick={handleCreateRoute}
                        disabled={isSubmitting || !routeName.trim()}
                    >
                        {isSubmitting ? (
                            <>
                                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                Создание...
                            </>
                        ) : (
                            <>
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-check-lg me-1" viewBox="0 0 16 16">
                                    <path d="M12.736 3.97a.733.733 0 0 1 1.047 0c.286.289.29.756.01 1.05L7.88 12.01a.733.733 0 0 1-1.065.02L3.217 8.384a.757.757 0 0 1 0-1.06.733.733 0 0 1 1.047 0l3.052 3.093 5.4-6.425a.247.247 0 0 1 .02-.022Z"/>
                                </svg>
                                Создать маршрут
                            </>
                        )}
                    </button>
                    <button
                        type="button"
                        className="btn btn-outline-secondary btn-lg"
                        onClick={() => navigate("/dashboard")}
                        disabled={isSubmitting}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-arrow-left-circle me-1" viewBox="0 0 16 16">
                            <path fillRule="evenodd" d="M1 8a7 7 0 1 0 14 0A7 7 0 0 0 1 8zm15 0A8 8 0 1 1 0 8a8 8 0 0 1 16 0zm-4.5-.5a.5.5 0 0 1 0 1H5.707l2.147 2.146a.5.5 0 0 1-.708.708l-3-3a.5.5 0 0 1 0-.708l3-3a.5.5 0 1 1 .708.708L5.707 7.5H11.5z"/>
                        </svg>
                        К моим маршрутам
                    </button>
                </div>
                {message && (
                    <div className={`alert ${isError ? 'alert-danger' : 'alert-success'} mt-3`} role="alert">
                        {message}
                    </div>
                )}
            </RouteEditorForm>
        </div>
    );
}

export default CreateRoutePage;