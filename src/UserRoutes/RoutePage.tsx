import {useNavigate, useParams} from "react-router-dom";
import {useEffect, useState} from "react";
import {Configuration, RoutePlaceDto, UserRouteDto, UserRouteDtoReq, UserRoutesApi} from "../api";
import getAccessToken from "../Utils/getAcessToken.ts";
import tryRefreshToken from "../Utils/tokenRefresher.ts";
import {useSelector} from "react-redux";
import {RootState} from "../state/authSlice.ts";
import PlaceList from "../Places/PlaceList.tsx";
// Make sure Bootstrap CSS is imported somewhere in your project,
// e.g., in your main App.tsx or index.tsx:
import 'bootstrap/dist/css/bootstrap.min.css';


const RoutePage = () => {
    const {id} = useParams<{ id: string }>(); // Specify id type for clarity
    const [message, setMessage] = useState<string | null>(null);
    const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
    const navigate = useNavigate();
    const [route, setRoute] = useState<UserRouteDto | null>(null); // Initialize with null
    const [userRouteDto, setUserRouteDto] = useState<UserRouteDtoReq | null>(null); // Initialize with null
    const [exceptedIds, setExceptedIds] = useState<string[]>([]);

    // Effect to handle authentication check
    useEffect(() => {
        if (!isAuthenticated) {
            navigate("/login");
        }
    }, [isAuthenticated, navigate]); // Dependency array includes isAuthenticated and navigate

    // Effect to fetch route data
    useEffect(() => {
        const fetchRouteFullInfo = async () => {
            if (!id) {
                console.error("Route ID is undefined");
                setMessage("Ошибка: ID маршрута не указан.");
                return;
            }

            setMessage("Загрузка маршрута...");
            const config = new Configuration({
                accessToken: getAccessToken,
            });
            const routesApi = new UserRoutesApi(config);

            try {
                const routeFullInfo = await routesApi.v1RoutesFullInfoIdGet({id});
                setRoute(routeFullInfo);
                // Initialize userRouteDto from the fetched data for editing
                // Ensure routePlaces are sorted by position when initialized
                const sortedRoutePlaces = (routeFullInfo.routePlaces ?? []).sort((a, b) => (a.placePosition ?? 0) - (b.placePosition ?? 0));

                setUserRouteDto({
                    name: routeFullInfo.name ?? '', // Use nullish coalescing for safety
                    routePlaces: sortedRoutePlaces as RoutePlaceDto[] // Use nullish coalescing for safety and cast
                });
                setExceptedIds(sortedRoutePlaces.map(rp => rp.placeId as string) ?? []); // Use nullish coalescing
                setMessage(null); // Clear loading message on success
            } catch (error: any) {
                console.error(error);
                if (error.response && error.response.status === 401) {
                    try {
                        await tryRefreshToken(error);
                        // Retry fetching after successful refresh
                        const routeFullInfo = await routesApi.v1RoutesFullInfoIdGet({id});
                        setRoute(routeFullInfo);
                        // Initialize userRouteDto from the fetched data, sorted
                        const sortedRoutePlaces = (routeFullInfo.routePlaces ?? []).sort((a, b) => (a.placePosition ?? 0) - (b.placePosition ?? 0));
                        setUserRouteDto({
                            name: routeFullInfo.name ?? '',
                            routePlaces: sortedRoutePlaces as RoutePlaceDto[]
                        });
                        setExceptedIds(sortedRoutePlaces.map(rp => rp.placeId as string) ?? []);
                        setMessage(null); // Clear loading message
                    } catch (refreshError: any) {
                        console.error("Failed to refresh token and fetch route", refreshError);
                        setMessage("Не удалось обновить токен и загрузить маршрут. Пожалуйста, войдите снова.");
                        navigate("/login"); // Redirect if refresh fails
                    }
                } else {
                    setMessage("Ошибка при загрузке маршрута.");
                    // Depending on requirement, maybe navigate to a 404 or routes list
                    // navigate("/routes");
                }
            }
        };

        if (isAuthenticated) { // Only fetch if authenticated
            fetchRouteFullInfo();
        }

    }, [id, isAuthenticated, navigate]); // Depend on id, isAuthenticated, and navigate

    const handleAddition = (placeId: string) => {

        setExceptedIds(prev => [...prev, placeId]);

        const currentPlaces = userRouteDto!.routePlaces ?? [];
        // Calculate new position based on current max position + 1
        const newPlacePosition = currentPlaces.length > 0
            ? Math.max(...currentPlaces.map(p => p.placePosition ?? 0)) + 1 // Use ?? 0 for safety
            : 0;

        setUserRouteDto(prev => {

            const updatedPlaces = [
                ...(prev!.routePlaces ?? []),
                {
                    placeId: placeId,
                    placePosition: newPlacePosition
                } as RoutePlaceDto
            ];
            updatedPlaces.sort((a, b) => (a.placePosition ?? 0) - (b.placePosition ?? 0));

            return {
                ...prev,
                routePlaces: updatedPlaces
            };
        });
        setMessage(`Место добавлено в маршрут (временно). Нажмите "Сохранить" для подтверждения.`);
    };

    const handleRemovePlace = (placeIdToRemove: string) => {
        if (!userRouteDto) return; // Cannot remove if userRouteDto is not initialized

        setUserRouteDto(prev => {
            if (!prev) return null; // Safety check

            const updatedPlaces = (prev.routePlaces ?? [])
                .filter(rp => rp.placeId !== placeIdToRemove) // Remove the place by ID
                // Sort the remaining places by their current position
                .sort((a, b) => (a.placePosition ?? 0) - (b.placePosition ?? 0))
                // Reassign placePosition sequentially (0, 1, 2...)
                .map((rp, index) => ({
                    ...rp,
                    placePosition: index // Assign new sequential position
                }));

            return {
                ...prev,
                routePlaces: updatedPlaces // Update the routePlaces array
            };
        });

        // Remove the placeId from the exceptedIds list so it appears in the PlaceList again
        setExceptedIds(prev => prev.filter(id => id !== placeIdToRemove));

        setMessage(`Место удалено из маршрута (временно). Нажмите "Сохранить" для подтверждения.`);
    };


    const handleChangeName = (name: string) => {
        setUserRouteDto(prev => {
            if (!prev) return null; // Cannot change name if userRouteDto is not initialized
            return {...prev, name: name};
        });
    }

    const handleUpdate = async () => {
        if (!userRouteDto || !id) {
            setMessage("Невозможно сохранить: данные маршрута или ID отсутствуют.");
            return;
        }

        setMessage("Сохранение маршрута...");
        const config = new Configuration({
            accessToken: getAccessToken,
        });
        const routesApi = new UserRoutesApi(config);

        try {
            // Ensure all routePlaces have placePosition defined before sending
            const routeDtoToSend: UserRouteDtoReq = {
                ...userRouteDto,
                routePlaces: userRouteDto.routePlaces?.map(rp => ({
                    ...rp,
                    placePosition: rp.placePosition ?? 0 // Default if somehow null/undefined
                })) ?? []
            };

            await routesApi.v1RoutesIdPut({
                id: id,
                userRouteDtoReq: routeDtoToSend
            });
            setMessage("Маршрут успешно обновлен!");
            // After successful save, potentially refetch or update the 'route' state
            // to sync the displayed name/places with the server's current state.
            // For simplicity here, we'll just update the message.
        } catch (error: any) {
            console.error(error);
            if (error.response && error.response.status === 401) {
                try {
                    await tryRefreshToken(error);
                    // Retry the PUT request after refresh
                    const routeDtoToSend: UserRouteDtoReq = { // Re-create DTO to be safe
                        ...userRouteDto,
                        routePlaces: userRouteDto.routePlaces?.map(rp => ({
                            ...rp,
                            placePosition: rp.placePosition ?? 0
                        })) ?? []
                    };
                    await routesApi.v1RoutesIdPut({
                        id: id,
                        userRouteDtoReq: routeDtoToSend
                    });
                    setMessage("Маршрут успешно обновлен после обновления токена!");
                } catch (refreshError: any) {
                    console.error("Failed to refresh token and save route", refreshError);
                    setMessage("Не удалось обновить токен и сохранить маршрут. Пожалуйста, войдите снова.");
                    navigate("/login"); // Redirect if refresh fails
                }
            } else {
                setMessage("Произошла ошибка при сохранении маршрута.");
            }
        }
    };

    // Show loading state or message if route data is not yet available
    if (!route || !userRouteDto || message === "Загрузка маршрута...") {
        return (
            <div className="container mt-4">
                <div className="alert alert-info" role="alert">
                    {message || "Загрузка..."}
                </div>
            </div>
        );
    }

    // Render the component once data is loaded
    const currentRoutePlaces = userRouteDto.routePlaces ?? [];

    return (
        <div className="container mt-4">
            <div className="card mb-4">
                <div className="card-body">
                    <h5 className="card-title">Редактирование маршрута</h5>

                    <div className="mb-3">
                        <label htmlFor="routeName" className="form-label">Название маршрута:</label>
                        <input
                            type="text"
                            className="form-control"
                            id="routeName"
                            // Use userRouteDto.name for the input value as it reflects the editable state
                            value={userRouteDto.name ?? ''}
                            onChange={(e) => handleChangeName(e.target.value)}
                        />
                    </div>

                    <button
                        className="btn btn-primary mb-3" // Added mb-3 for margin below button
                        onClick={handleUpdate}
                        // Disable button while saving or if data is somehow missing
                        disabled={!userRouteDto}
                    >
                        Сохранить маршрут
                    </button>

                    {message && (
                        <div
                            className={`alert ${message.includes('успешно') ? 'alert-success' : message.includes('Сохранение') || message.includes('добавлено') || message.includes('удалено') ? 'alert-info' : 'alert-danger'} mt-3`}
                            role="alert">
                            {message}
                        </div>
                    )}

                    <hr className="my-4"/>
                    <h5 className="mb-3">Места в маршруте:</h5>
                    {currentRoutePlaces.length === 0 ? (
                        <div className="alert alert-secondary" role="alert">
                            В этом маршруте пока нет мест. Добавьте их из списка ниже.
                        </div>
                    ) : (
                        // FIXED: Removed whitespace around table, thead, tbody, and tr tags
                        <table className="table table-striped table-hover">
                            <thead>
                            <tr>
                                <th scope="col">Порядок</th>
                                <th scope="col">ID Места</th>
                                <th scope="col">Действия</th>
                            </tr>
                            </thead>
                            <tbody>
                            {currentRoutePlaces
                                .sort((a, b) => (a.placePosition ?? 0) - (b.placePosition ?? 0))
                                .map((place, index) => (
                                    <tr key={place.placeId ?? index}>
                                        <td>                                                                         {(place.placePosition ?? 0) + 1}</td>
                                        <td>{place.placeId}</td>
                                        <td>
                                            <button
                                                className="btn btn-sm btn-info me-2" // me-2 adds right margin
                                                onClick={() => navigate(`/places/${place.placeId}`)} // Navigate to place page
                                                disabled={!place.placeId} // Disable if placeId is somehow missing
                                            >
                                                Просмотр
                                            </button>
                                            <button
                                                className="btn btn-sm btn-danger"
                                                onClick={() => handleRemovePlace(place.placeId as string)} // Pass placeId to handler
                                                disabled={!place.placeId} // Disable if placeId is somehow missing
                                            >
                                                Удалить
                                            </button>
                                        </td>
                                    </tr> // End tr immediately after last td
                                ))}
                            </tbody>
                        </table> // End table immediately after tbody
                    )}

                </div>
            </div>

            <h5 className="mb-3">Добавить места в маршрут:</h5>
            <PlaceList
                isPreview={false}
                exceptIds={exceptedIds}
                additionCallBack={handleAddition}
            />
        </div>
    )
}

export default RoutePage;