import React, { useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import { Configuration, PlaceDto, PlacesApi } from "../api";
import getAccessToken from "../Utils/getAcessToken.ts";
import tryRefreshToken from "../Utils/tokenRefresher.ts";
import 'bootstrap/dist/css/bootstrap.min.css'; 

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L, { LatLngExpression } from 'leaflet';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});


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
                    
                    await tryRefreshToken(err);
                    
                    const fetchedPlace = await attemptFetch();
                    setPlace(fetchedPlace);
                } catch (refreshError: any) { 
                    console.error("Error during token refresh or subsequent fetch:", refreshError);
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

    
    const canShowMap = typeof place.latitude === 'number' && typeof place.longitude === 'number';
    const placeCoordinates: LatLngExpression | undefined = canShowMap
        ? [place.latitude!, place.longitude!]
        : undefined;

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
                                            style={{ height: '250px', width: '100%', objectFit: 'cover' }}
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

                    
                    {canShowMap && (
                        <div className="mb-3"> 
                            <h4>Местоположение (ссылка)</h4>
                            <a
                                href={`https://yandex.ru/maps/?pt=${place.longitude},${place.latitude}&z=16&l=map`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn btn-outline-primary btn-sm"
                            >
                                Посмотреть на Яндекс.Картах
                            </a>
                            <span className="ms-2 text-muted small">
                                ({place.latitude!.toFixed(4)}, {place.longitude!.toFixed(4)})
                            </span>
                        </div>
                    )}
                </div>
            </div> 

            
            {canShowMap && placeCoordinates && (
                <div className="row mt-4">
                    <div className="col-12">
                        <div className="card shadow-sm">
                            <div className="card-header">
                                <h5 className="mb-0">Местоположение на карте</h5>
                            </div>
                            
                            <div className="card-body p-0" style={{ height: '400px', width: '100%', borderRadius: '0 0 .25rem .25rem', overflow: 'hidden' }}>
                                <MapContainer
                                    center={placeCoordinates}
                                    zoom={15} 
                                    scrollWheelZoom={true}
                                    style={{ height: "100%", width: "100%" }}
                                >
                                    <TileLayer
                                        attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                    />
                                    <Marker position={placeCoordinates}>
                                        <Popup>
                                            <b>{place.name ?? 'Местоположение'}</b>
                                            
                                            
                                            <br/>Координаты: ({place.latitude!.toFixed(4)}, {place.longitude!.toFixed(4)})
                                        </Popup>
                                    </Marker>
                                </MapContainer>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PlacePage;