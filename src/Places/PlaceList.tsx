import React, { useEffect, useState, useCallback } from "react"; // Import React and useCallback
import { Configuration, FilterDto, PlaceDto, PlacesApi } from "../api";
import getAccessToken from "../Utils/getAcessToken.ts";
import tryRefreshToken from "../Utils/tokenRefresher.ts";
import PlaceCard from "./PlaceCard.tsx";
import Filter from "./Filter.tsx"; // Keep Filter import

interface PlaceListProps {
    isPreview: boolean
}
const PlaceList: React.FC<PlaceListProps> = ({isPreview}: PlaceListProps) => { // Use React.FC
    const [places, setPlaces] = useState<PlaceDto[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true); // Add loading state
    const [error, setError] = useState<string | null>(null); // Add error state
    const [currentFilter, setCurrentFilter] = useState<FilterDto | undefined>(undefined); // Store current filter

    // Use useCallback to memoize fetchPlaces, prevents unnecessary calls if passed down
    const fetchPlaces = useCallback(async (filterDto?: FilterDto | undefined) => {
        setIsLoading(true); // Start loading
        setError(null); // Clear previous errors
        console.log("Fetching places with filter:", filterDto); // Log the filter being used

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
            setPlaces(fetchedPlaces ?? []); // Handle null/undefined response
        } catch (err: any) {
            console.error("API Error:", err);
            if (err.response && err.response.status === 401) {
                console.log("Caught 401, attempting token refresh...");
                await tryRefreshToken(err); // Assuming this returns true on success or throws
                const fetchedPlaces = await attemptFetch(); // Retry with new token
                setPlaces(fetchedPlaces ?? []);
            } else {
                // Handle other errors (network, server errors, etc.)
                setError(`Не удалось загрузить места: ${err.message || 'Неизвестная ошибка'}`);
                setPlaces([]); // Clear places on error
            }
        } finally {
            setIsLoading(false); // Stop loading regardless of outcome
        }
    }, []); // Empty dependency array for useCallback as it doesn't depend on props/state outside its scope

    // Initial fetch on component mount
    useEffect(() => {
        fetchPlaces(currentFilter); // Fetch with initial (undefined) filter
    }, [fetchPlaces]); // Depend on fetchPlaces (which is memoized)

    // Handler for when the Filter component submits
    const handleFilterSubmit = useCallback(async (filterDto: FilterDto | undefined): Promise<void> => {
        console.log("Filter submitted:", filterDto);
        setCurrentFilter(filterDto); // Update the stored filter state
        await fetchPlaces(filterDto); // Fetch data with the new filter
    }, [fetchPlaces]); // Depend on fetchPlaces

    return (
        // Use Bootstrap container for padding and centering
        <div className="container mt-4">
            <div className="row">
                {/* Filter Column */}
                <div className="col-lg-3 col-md-4 mb-4 mb-md-0"> {/* Responsive column sizes */}
                    <Filter onSubmit={handleFilterSubmit} />
                </div>

                {/* Places List Column */}
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
                        <div className="row row-cols-1 row-cols-sm-2 row-cols-lg-3 g-4"> {/* Grid layout for cards */}
                            {places.length > 0 ? (
                                places.map((place) => (
                                    // Ensure place.id is valid and unique for the key
                                    // Use col class within the grid row
                                    place.id && place.photosUrl && place.photosUrl.length > 0 ? (
                                        <div className="col" key={place.id}>
                                            <PlaceCard
                                                id={place.id}
                                                name={place.name}
                                                photoUrl={place.photosUrl[0]} // Assuming first photo
                                                isPreview={isPreview}
                                            />
                                        </div>
                                    ) : null // Skip rendering if essential data is missing
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