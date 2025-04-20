import {Configuration, PlaceDto, PlacesApi} from "../api";
import {useEffect, useState} from "react";
import getAccessToken from "../Utils/getAcessToken.ts";
import tryRefreshToken from "../Utils/tokenRefresher.ts";
import PlaceCard from "./PlaceCard.tsx";

const PlaceList = () => {
    const [places, setPlaces] = useState<PlaceDto[]>([]);
    useEffect(() => {
        const fetchPlaces = async () => {
            const config = new Configuration({
                accessToken: getAccessToken,
            });
            const placesApi = new PlacesApi(config);

            try {
                const places = await placesApi.v1PlacesPost();
                setPlaces(places);
            }
            catch(error: any) {
                if (error.response && error.response.status === 401) {
                    await tryRefreshToken(error);
                    const places = await placesApi.v1PlacesPost();
                    setPlaces(places);
                }
            }
        }
        fetchPlaces();
    })

    return (
        <div>
            {places.map((place) => (
                <>
                    {place.photosUrl &&
                        <PlaceCard id={place.id} name={place.name} photoUrl={place.photosUrl[0]} />}
                </>
            ))}
        </div>
    )

}

export default PlaceList;