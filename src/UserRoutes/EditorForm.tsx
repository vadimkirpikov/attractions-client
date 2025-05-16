import React, {useEffect, useMemo} from "react";
import { useNavigate } from "react-router-dom";
import { RoutePlaceDto } from "../api";
import PlaceList from "../Places/PlaceList.tsx";
import 'bootstrap/dist/css/bootstrap.min.css';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L, { LatLngExpression } from 'leaflet';


delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

export interface DisplayRoutePlace extends RoutePlaceDto {
    cost?: number;
    latitude?: number;
    longitude?: number;
}

export interface PlaceAdditionInfo {
    id: string;
    name: string;
    cost: number;
    latitude: number;
    longitude: number;
}


const FitBoundsToMarkers = ({ places }: { places: DisplayRoutePlace[] }) => {
    const map = useMap();
    const izhevskCoords: LatLngExpression = [56.8526, 53.2095];

    useEffect(() => {
        if (!map || !(map as any)._container) return;
        const validPlacesWithCoords = places.filter(p => typeof p.latitude === 'number' && typeof p.longitude === 'number');
        if (validPlacesWithCoords.length > 0) {
            const bounds = L.latLngBounds(validPlacesWithCoords.map(p => [p.latitude!, p.longitude!] as LatLngExpression));
            if (bounds.isValid()) {
                map.fitBounds(bounds, { padding: [50, 50], maxZoom: 16 });
            } else if (validPlacesWithCoords.length === 1) {
                map.setView([validPlacesWithCoords[0].latitude!, validPlacesWithCoords[0].longitude!], 13);
            } else {
                map.setView(izhevskCoords, 12);
            }
        } else {
            map.setView(izhevskCoords, 12);
        }
    }, [places, map]);
    return null;
};

const createNumberedIcon = (number: number) => {
    return L.divIcon({
        html: `<div style="background-color: #0d6efd; color: white; border-radius: 50%; width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; font-size: 14px; font-weight: bold; border: 2px solid white; box-shadow: 0 0 5px rgba(0,0,0,0.5);">${number}</div>`,
        className: 'custom-numbered-icon',
        iconSize: [30, 30],
        iconAnchor: [15, 15],
        popupAnchor: [0, -15]
    });
};

function toRadians(degrees: number): number {
    return degrees * Math.PI / 180;
}

function calculateHaversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // km
    const dLat = toRadians(lat2 - lat1);
    const dLon = toRadians(lon2 - lon1);
    const rLat1 = toRadians(lat1);
    const rLat2 = toRadians(lat2);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(rLat1) * Math.cos(rLat2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}


interface RouteEditorFormProps {
    routeName: string;
    onRouteNameChange: (name: string) => void;
    routePlaces: DisplayRoutePlace[];
    onAddPlace: (placeInfo: PlaceAdditionInfo) => void;
    onRemovePlace: (placeId: string) => void;
    exceptedIds: string[]; 
    children?: React.ReactNode; 
}

const RouteEditorForm: React.FC<RouteEditorFormProps> = ({
                                                             routeName,
                                                             onRouteNameChange,
                                                             routePlaces,
                                                             onAddPlace,
                                                             onRemovePlace,
                                                             exceptedIds,
                                                             children 
                                                         }) => {
    const navigate = useNavigate();

    const totalCost = useMemo(() => {
        return routePlaces.reduce((sum, place) => sum + (place.cost ?? 0), 0);
    }, [routePlaces]);

    const mapPlacesForDisplay = useMemo(() => {
        return routePlaces
            .filter(p => typeof p.latitude === 'number' && typeof p.longitude === 'number')
            .sort((a, b) => (a.placePosition ?? 0) - (b.placePosition ?? 0));
    }, [routePlaces]);

    const polylinePositions = useMemo((): LatLngExpression[] => {
        return mapPlacesForDisplay.map(p => [p.latitude!, p.longitude!] as LatLngExpression);
    }, [mapPlacesForDisplay]);

    const totalRouteLength = useMemo(() => {
        let length = 0;
        if (mapPlacesForDisplay.length > 1) {
            for (let i = 0; i < mapPlacesForDisplay.length - 1; i++) {
                const place1 = mapPlacesForDisplay[i];
                const place2 = mapPlacesForDisplay[i + 1];
                length += calculateHaversineDistance(
                    place1.latitude!, place1.longitude!,
                    place2.latitude!, place2.longitude!
                );
            }
        }
        return length;
    }, [mapPlacesForDisplay]);

    const mapContainerKey = useMemo(() => {
        return mapPlacesForDisplay.map(p => `${p.placeId}_${p.placePosition}`).join('|') + `_len${mapPlacesForDisplay.length}`;
    }, [mapPlacesForDisplay]);

    return (
        <>
            
            <div className="card shadow-sm mb-4">
                <div className="card-body">
                    <div className="mb-3">
                        <label htmlFor="routeName" className="form-label fs-5">Название маршрута:</label>
                        <input
                            id="routeName"
                            className="form-control form-control-lg"
                            type="text"
                            placeholder="Введите название вашего маршрута"
                            value={routeName}
                            onChange={e => onRouteNameChange(e.target.value)}
                            aria-label="Название маршрута"
                        />
                    </div>
                    {children}
                </div>
            </div>

            
            <div className="card shadow-sm mb-4">
                <div className="card-header bg-light">
                    <h5 className="my-0 fw-normal">Места в маршруте ({routePlaces.length})</h5>
                </div>
                <div className="card-body">
                    {routePlaces.length === 0 ? (
                        <div className="alert alert-secondary text-center" role="alert">
                            В этом маршруте пока нет мест. Добавьте их из списка ниже.
                        </div>
                    ) : (
                        <>
                            <div className="table-responsive">
                                <table className="table table-striped table-hover align-middle">
                                    <thead className="table-light">
                                    <tr>
                                        <th scope="col" style={{width: "10%"}} className="text-center">Порядок</th>
                                        <th scope="col">Наименование</th>
                                        <th scope="col" style={{width: "15%"}} className="text-end">Стоимость</th>
                                        <th scope="col" style={{width: "25%"}} className="text-center">Действия</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {routePlaces
                                        .sort((a,b) => (a.placePosition ?? 0) - (b.placePosition ?? 0)) 
                                        .map((place) => (
                                            <tr key={place.placeId}>
                                                <td className="text-center">{(place.placePosition ?? 0) + 1}</td>
                                                <td>{place.placeName ?? 'Название не указано'}</td>
                                                <td className="text-end">{(place.cost ?? 0).toFixed(2)} руб.</td>
                                                <td className="text-center">
                                                    <button
                                                        title="Просмотреть детали места"
                                                        className="btn btn-sm btn-outline-info me-2"
                                                        onClick={() => navigate(`/places/${place.placeId}`)}
                                                        disabled={!place.placeId}
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-eye" viewBox="0 0 16 16"><path d="M16 8s-3-5.5-8-5.5S0 8 0 8s3 5.5 8 5.5S16 8 16 8zM1.173 8a13.133 13.133 0 0 1 1.66-2.043C4.12 4.668 5.88 3.5 8 3.5c2.12 0 3.879 1.168 5.168 2.457A13.133 13.133 0 0 1 14.828 8c-.058.087-.122.183-.195.288-.335.48-.83 1.12-1.465 1.755C11.879 11.332 10.119 12.5 8 12.5c-2.12 0-3.879-1.168-5.168-2.457A13.134 13.134 0 0 1 1.172 8z"/><path d="M8 5.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5zM4.5 8a3.5 3.5 0 1 1 7 0 3.5 3.5 0 0 1-7 0z"/></svg>
                                                    </button>
                                                    <button
                                                        title="Удалить место из маршрута"
                                                        className="btn btn-sm btn-outline-danger"
                                                        onClick={() => onRemovePlace(place.placeId!)}
                                                        disabled={!place.placeId}
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-trash" viewBox="0 0 16 16"><path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5Zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5Zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6Z"/><path d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1ZM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118ZM2.5 3h11V2h-11v1Z"/></svg>
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <div className="mt-3 pt-3 border-top d-flex justify-content-end align-items-center">
                                <h5 className="mb-0 me-3">Итоговая стоимость: <span className="fw-bold">{totalCost.toFixed(2)} руб.</span></h5>
                                <h5 className="mb-0">Общая длина: <span className="fw-bold">{totalRouteLength.toFixed(2)} км</span></h5>
                            </div>
                        </>
                    )}
                </div>
            </div>

            
            <div className="card shadow-sm mb-4">
                <div className="card-header bg-light">
                    <h5 className="my-0 fw-normal">Карта маршрута (г. Ижевск)</h5>
                </div>
                <div className="card-body p-0" style={{ height: '500px', borderBottomLeftRadius: '0.25rem', borderBottomRightRadius: '0.25rem', overflow: 'hidden' }}>
                    <MapContainer
                        key={mapContainerKey}
                        center={[56.8526, 53.2095]}
                        zoom={12}
                        scrollWheelZoom={true}
                        style={{ height: "100%", width: "100%" }}
                    >
                        <TileLayer
                            attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                        <FitBoundsToMarkers places={mapPlacesForDisplay} />
                        {mapPlacesForDisplay.map((place) => (
                            <Marker
                                key={`${place.placeId}_${place.placePosition}`}
                                position={[place.latitude!, place.longitude!]}
                                icon={createNumberedIcon((place.placePosition ?? 0) + 1)}
                            >
                                <Popup>
                                    <b>{ (place.placePosition ?? 0) + 1 }. {place.placeName}</b><br />
                                    Стоимость: {(place.cost ?? 0).toFixed(2)} руб.
                                </Popup>
                            </Marker>
                        ))}
                        {polylinePositions.length > 1 && (
                            <Polyline
                                pathOptions={{ color: '#0d6efd', weight: 4, opacity: 0.8 }}
                                positions={polylinePositions}
                                key={`polyline-${mapContainerKey}`}
                            />
                        )}
                    </MapContainer>
                </div>
                {mapPlacesForDisplay.length === 0 && routePlaces.length > 0 && (
                    <div className="card-footer">
                        <div className="alert alert-warning mb-0" role="alert">
                            Ни одно место в маршруте не имеет координат для отображения на карте.
                        </div>
                    </div>
                )}
            </div>

            
            <div className="card shadow-sm">
                <div className="card-header bg-light">
                    <h5 className="my-0 fw-normal">Добавить места в маршрут</h5>
                </div>
                <div className="card-body">
                    <PlaceList
                        isPreview={false}
                        exceptIds={exceptedIds}
                        additionCallBack={onAddPlace}
                    />
                </div>
            </div>
        </>
    );
};

export default RouteEditorForm;