import {Configuration, FilterDto, PlaceDto, PlacesApi} from "../api";
import {useEffect, useState} from "react";
import getAccessToken from "../Utils/getAcessToken.ts";
import tryRefreshToken from "../Utils/tokenRefresher.ts";
import PlaceCard from "./PlaceCard.tsx";
import Filter from "./Filter.tsx";

const PlaceList = () => {
    const [places, setPlaces] = useState<PlaceDto[]>([]);
    const fetchPlaces = async (filterDto?: FilterDto | undefined) => {
        const config = new Configuration({
            accessToken: getAccessToken,
        });
        const placesApi = new PlacesApi(config);

        try {
            const places = await placesApi.v1PlacesPost({filterDto: filterDto});
            setPlaces(places);
        }
        catch(error: any) {
            if (error.response && error.response.status === 401) {
                await tryRefreshToken(error);
                const places = await placesApi.v1PlacesPost({filterDto: filterDto});
                setPlaces(places);
            }
        }
    }
    useEffect(() => {
        fetchPlaces();
    }, [])

    const handleFilterSubmit = async (filterDto: FilterDto | undefined): Promise<void> => {
        fetchPlaces(filterDto);
        console.log(filterDto);
    }

    return (
        <div>
            <Filter onSubmit={handleFilterSubmit} />
            <div>
                {places.map((place) => (
                    place.photosUrl && (
                        <PlaceCard
                            key={place.id}
                            id={place.id}
                            name={place.name}
                            photoUrl={place.photosUrl[0]}
                            isPreview={true}
                        />
                    )
                ))}
            </div>
        </div>
    )


}

export default PlaceList;