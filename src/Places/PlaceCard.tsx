import {useNavigate} from "react-router-dom";

interface PlaceCardDto {
    id?: string | null,
    name?: string | null,
    photoUrl: string,
    isPreview?: boolean,
}
const PlaceCard = (placeDto: PlaceCardDto) => {
    const navigate = useNavigate();
    const redirectToPlaceDetails = ()=> {
        navigate(`/places/${placeDto.id}`);
    }
    return (
        <>
            <div>
                <h4>{placeDto.name}</h4>
                <img src={placeDto.photoUrl} alt={"а тут нету"}/>
                <div className="d-flex flex-row justify-content-around">
                    <button className={"btn btn-primary"} onClick={redirectToPlaceDetails}>Подробнее</button>
                    {!placeDto.isPreview && (<button className={"btn btn-primary"}>Добавить</button>)}
                </div>
            </div>
        </>
    )
}

export default PlaceCard;