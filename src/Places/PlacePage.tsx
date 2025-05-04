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
                {/* Spinner using native Bootstrap classes */}
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
                {/* Alert using native Bootstrap classes */}
                <div className="alert alert-danger" role="alert">
                    {error}
                </div>
            </div>
        );
    }

    if (!place) {
        return (
            <div className="container mt-4">
                {/* Warning Alert using native Bootstrap classes */}
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
        // Container using native Bootstrap class
        <div className="container mt-4 mb-5">
            {/* Row using native Bootstrap class */}
            <div className="row">
                {/* Column 1: Images */}
                {/* Column using native Bootstrap class */}
                <div className="col-md-6 mb-4 mb-md-0">
                    {place.photosUrl && place.photosUrl.length > 0 ? (
                        // Simple Image Gallery using Bootstrap Grid
                        <div className="row g-2"> {/* Use g-2 for small gutters */}
                            {place.photosUrl.map((photo, index) => (
                                photo ? (
                                    // Display first image larger, others smaller? Or all in a grid.
                                    // Let's do a grid for now. col-6 makes 2 images per row.
                                    <div className="col-6" key={index}>
                                        <img
                                            src={photo}
                                            alt={`${place.name ?? 'Место'} - Фото ${index + 1}`}
                                            className="img-fluid rounded" // Responsive image, rounded corners
                                            style={{ maxHeight: '250px', width: '100%', objectFit: 'cover' }} // Control size
                                        />
                                    </div>
                                ) : null
                            ))}
                        </div>

                        // Alternative: If you wanted a *very* basic Carousel structure manually
                        // You would need state for activeIndex and buttons to change it
                        // <div id="placeImageCarousel" className="carousel slide" data-bs-ride="carousel">
                        //     <div className="carousel-inner">
                        //         {place.photosUrl.map((photo, index) => (
                        //             photo ? (
                        //                 <div className={`carousel-item ${index === activeIndex ? 'active' : ''}`} key={index}>
                        //                     <img src={photo} className="d-block w-100 rounded" alt={`Slide ${index + 1}`} style={{ maxHeight: '500px', objectFit: 'cover' }}/>
                        //                 </div>
                        //             ) : null
                        //         ))}
                        //     </div>
                        //     {place.photosUrl.length > 1 && (
                        //         <>
                        //             <button className="carousel-control-prev" type="button" data-bs-target="#placeImageCarousel" data-bs-slide="prev">
                        //                 <span className="carousel-control-prev-icon" aria-hidden="true"></span>
                        //                 <span className="visually-hidden">Previous</span>
                        //             </button>
                        //             <button className="carousel-control-next" type="button" data-bs-target="#placeImageCarousel" data-bs-slide="next">
                        //                 <span className="carousel-control-next-icon" aria-hidden="true"></span>
                        //                 <span className="visually-hidden">Next</span>
                        //             </button>
                        //         </>
                        //     )}
                        // </div>
                    ) : (
                        <div className="text-center text-muted border rounded p-5 d-flex align-items-center justify-content-center" style={{ minHeight: '300px' }}>
                            Нет доступных изображений
                        </div>
                    )}
                </div>

                {/* Column 2: Text Details */}
                {/* Column using native Bootstrap class */}
                <div className="col-md-6">
                    {/* Place Name */}
                    <h1 className="mb-3">{place.name ?? 'Название не указано'}</h1>

                    {/* Category and District Badges */}
                    <div className="mb-3">
                        {place.categoryName && (
                            // Badge using native Bootstrap classes
                            <span className="badge text-bg-info me-2 p-2">{place.categoryName}</span>
                        )}
                        {place.districtName && (
                            // Badge using native Bootstrap classes
                            <span className="badge text-bg-secondary p-2">{place.districtName}</span>
                        )}
                    </div>

                    {/* Description */}
                    <div className="mb-4">
                        <h4>Описание</h4>
                        <p style={{ whiteSpace: 'pre-wrap' }}>
                            {place.description || <span className="text-muted">Описание отсутствует.</span>}
                        </p>
                    </div>

                    {/* Cost */}
                    <div className="mb-4">
                        <h4>Стоимость</h4>
                        <p className="fs-5">{formattedCost}</p> {/* fs-5 for larger font size */}
                    </div>

                    {/* Map Link */}
                    {place.latitude && place.longitude && (
                        <div className="mb-4">
                            <h4>Местоположение</h4>
                            <a
                                href={`https://yandex.ru/maps/?pt=${place.longitude},${place.latitude}&z=16&l=map`}
                                target="_blank"
                                rel="noopener noreferrer"
                                // Button styling using native Bootstrap classes
                                className="btn btn-outline-primary btn-sm"
                            >
                                Посмотреть на карте (Yandex)
                            </a>
                            <span className="ms-2 text-muted small"> {/* ms-2 for margin start */}
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