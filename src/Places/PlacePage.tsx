import {useParams} from "react-router-dom";
import {useEffect, useState} from "react";
import {Configuration, PlaceDto, PlacesApi} from "../api";
import getAccessToken from "../Utils/getAcessToken.ts";
import tryRefreshToken from "../Utils/tokenRefresher.ts";


const PlacePage = () => {
    const { id } = useParams()
    const [place, setPlace] = useState<PlaceDto>();
    useEffect(() => {
        const fetchPlace = async () => {
            const config = new Configuration({
                accessToken: getAccessToken,
            });
            const placesApi = new PlacesApi(config);
            try {
                if (id) {
                    const place = await placesApi.v1PlacesPlaceIdGet({ placeId: id })
                    setPlace(place);
                }
            }
            catch (error: any) {
                if (error.response && error.response.status === 401) {
                    await tryRefreshToken(error);
                    if (id) {
                        const place = await placesApi.v1PlacesPlaceIdGet({ placeId: id })
                        setPlace(place);
                    }
                }
            }
        }
        fetchPlace();
    }, [])
    return (
        <>
            {place?.photosUrl && <div style={{textAlign: "center"}}>{place?.photosUrl.map((photo, index) => {
                if (photo) {
                    return (<img src={photo} key={index} alt={"а тут нету"}/>)
                }
                return null;
            })}</div>}
        </>
    )
}
export default PlacePage;