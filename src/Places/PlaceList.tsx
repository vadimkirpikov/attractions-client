import React, { useEffect, useState, useCallback } from "react"; // Import React and useCallback
import { Configuration, FilterDto, PlaceDto, PlacesApi } from "../api";
import getAccessToken from "../Utils/getAcessToken.ts";
import tryRefreshToken from "../Utils/tokenRefresher.ts";
import PlaceCard from "./PlaceCard.tsx";
import Filter from "./Filter.tsx"; // Keep Filter import

interface PlaceListProps {
    isPreview: boolean,
    exceptIds: Array<string>,
    additionCallBack: (id: string) => void,
}
const PlaceList: React.FC<PlaceListProps> = ({isPreview, exceptIds, additionCallBack}: PlaceListProps) => {
    const [places, setPlaces] = useState<PlaceDto[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [currentFilter, setCurrentFilter] = useState<FilterDto | undefined>(undefined);

    const fetchPlaces = useCallback(async (filterDto?: FilterDto | undefined) => {
        setIsLoading(true);
        setError(null);
        console.log("Fetching places with filter:", filterDto);

        const config = new Configuration({
            accessToken: getAccessToken,
        });
        const placesApi = new PlacesApi(config);

        const attemptFetch = async () => {
            const payload = filterDto ? { filterDto } : {};
            return await placesApi.v1PlacesPost(payload);
        }

        try {
            const fetchedPlaces = await attemptFetch();
            setPlaces(fetchedPlaces.filter(place => !exceptIds.includes(place.id as string)) ?? []);
        } catch (err: any) {
            console.error("API Error:", err);
            if (err.response && err.response.status === 401) {
                console.log("Caught 401, attempting token refresh...");
                await tryRefreshToken(err);
                const fetchedPlaces = await attemptFetch();
                setPlaces(fetchedPlaces.filter(place => !exceptIds.includes(place.id as string)) ?? []);
            } else {
                setError(`Не удалось загрузить места: ${err.message || 'Неизвестная ошибка'}`);
                setPlaces([]);
            }
        } finally {
            setIsLoading(false);
        }
    }, [exceptIds]);

    useEffect(() => {
        fetchPlaces(currentFilter);
    }, [fetchPlaces]);

    const handleFilterSubmit = useCallback(async (filterDto: FilterDto | undefined): Promise<void> => {
        console.log("Filter submitted:", filterDto);
        setCurrentFilter(filterDto);
        await fetchPlaces(filterDto);
    }, [fetchPlaces]);

    return (
        <div className="container mt-4">
            <div className="row">
                <div className="col-lg-3 col-md-4 mb-4 mb-md-0">
                    <Filter onSubmit={handleFilterSubmit} />
                </div>

                <div className="col-lg-9 col-md-8">
                    <h2 className="mb-4">Доступные места</h2>
                    {isLoading && (
                        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '300px' }}>
                            <div className="spinner-border text-primary" role="status">
                                <span className="visually-hidden">Загрузка...</span>
                            </div>
                        </div>
                    )}
                    {error && (
                        <div className="alert alert-danger" role="alert">
                            {error}
                        </div>
                    )}
                    {!isLoading && !error && (
                        <div className="row row-cols-1 row-cols-sm-2 row-cols-lg-3 g-4">
                            {places.length > 0 ? (
                                places.map((place) => (
                                    place.id && place.photosUrl && place.photosUrl.length > 0 ? (
                                        <div className="col" key={place.id}>
                                            <PlaceCard
                                                id={place.id}
                                                name={place.name}
                                                photoUrl={place.photosUrl[0]}
                                                isPreview={isPreview}
                                                addCallBack={additionCallBack}
                                            />
                                        </div>
                                    ) : null
                                ))
                            ) : (
                                <div className="col-12">
                                    <p className="text-center text-muted">Места по заданным фильтрам не найдены.</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PlaceList;