import React, { useEffect, useState, useCallback } from "react"; // Import React and useCallback
import { useParams } from "react-router-dom";
import { Configuration, PlaceDto, PlacesApi } from "../api";
import getAccessToken from "../Utils/getAcessToken.ts";
import tryRefreshToken from "../Utils/tokenRefresher.ts";


const PlacePage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [place, setPlace] = useState<PlaceDto | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const fetchPlace = useCallback(async () => {
        if (!id) {
            setError("ID места не указан.");
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        setError(null);
        setPlace(null);

        const config = new Configuration({
            accessToken: getAccessToken,
        });
        const placesApi = new PlacesApi(config);

        const attemptFetch = async () => {
            return await placesApi.v1PlacesPlaceIdGet({ placeId: id });
        }

        try {
            console.log(`Fetching place with ID: ${id}`);
            const fetchedPlace = await attemptFetch();
            setPlace(fetchedPlace);
        } catch (err: any) {
            console.error("API Error fetching place:", err);
            if (err.response && err.response.status === 401) {
                console.log("Caught 401, attempting token refresh...");
                try {
                    await tryRefreshToken(error);
                    const fetchedPlace = await attemptFetch();
                    setPlace(fetchedPlace);
                } catch (refreshError) {
                    console.error("Error during token refresh:", refreshError);
                    setError("Ошибка обновления сессии. Пожалуйста, войдите снова.");
                }
            } else {
                if (err.response && err.response.status === 404) {
                    setError(`Место с ID ${id} не найдено.`);
                } else {
                    setError(`Не удалось загрузить информацию о месте: ${err.message || 'Неизвестная ошибка'}`);
                }
            }
        } finally {
            setIsLoading(false);
        }
    }, [id]);

    useEffect(() => {
        fetchPlace();
    }, [fetchPlace]);

    // --- Rendering Logic ---

    if (isLoading) {
        return (
            <div className="container text-center mt-5">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Загрузка...</span>
                </div>
                <p className="mt-2">Загрузка информации о месте...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mt-4">
                <div className="alert alert-danger" role="alert">
                    {error}
                </div>
            </div>
        );
    }

    if (!place) {
        return (
            <div className="container mt-4">
                <div className="alert alert-warning" role="alert">
                    Информация о месте недоступна.
                </div>
            </div>
        );
    }

    const formattedCost = place.cost != null
        ? `${place.cost.toLocaleString('ru-RU')} ₽`
        : 'Бесплатно или цена не указана';

    return (
        <div className="container mt-4 mb-5">
            <div className="row">
                <div className="col-md-6 mb-4 mb-md-0">
                    {place.photosUrl && place.photosUrl.length > 0 ? (
                        <div className="row g-2">
                            {place.photosUrl.map((photo, index) => (
                                photo ? (
                                    <div className="col-6" key={index}>
                                        <img
                                            src={photo}
                                            alt={`${place.name ?? 'Место'} - Фото ${index + 1}`}
                                            className="img-fluid rounded"
                                            style={{ maxHeight: '250px', width: '100%', objectFit: 'cover' }}
                                        />
                                    </div>
                                ) : null
                            ))}
                        </div>
                    ) : (
                        <div className="text-center text-muted border rounded p-5 d-flex align-items-center justify-content-center" style={{ minHeight: '300px' }}>
                            Нет доступных изображений
                        </div>
                    )}
                </div>

                <div className="col-md-6">
                    <h1 className="mb-3">{place.name ?? 'Название не указано'}</h1>

                    <div className="mb-3">
                        {place.categoryName && (
                            <span className="badge text-bg-info me-2 p-2">{place.categoryName}</span>
                        )}
                        {place.districtName && (
                            <span className="badge text-bg-secondary p-2">{place.districtName}</span>
                        )}
                    </div>

                    <div className="mb-4">
                        <h4>Описание</h4>
                        <p style={{ whiteSpace: 'pre-wrap' }}>
                            {place.description || <span className="text-muted">Описание отсутствует.</span>}
                        </p>
                    </div>

                    <div className="mb-4">
                        <h4>Стоимость</h4>
                        <p className="fs-5">{formattedCost}</p>
                    </div>

                    {place.latitude && place.longitude && (
                        <div className="mb-4">
                            <h4>Местоположение</h4>
                            <a
                                href={`https://yandex.ru/maps/?pt=${place.longitude},${place.latitude}&z=16&l=map`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn btn-outline-primary btn-sm"
                            >
                                Посмотреть на карте (Yandex)
                            </a>
                            <span className="ms-2 text-muted small">
                                ({place.latitude.toFixed(4)}, {place.longitude.toFixed(4)})
                            </span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PlacePage;