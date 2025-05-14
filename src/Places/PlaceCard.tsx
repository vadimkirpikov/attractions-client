import React from "react"; // Import React
import {useNavigate} from "react-router-dom";

interface PlaceCardDto {
    id?: string | null,
    name?: string | null,
    photoUrl: string,
    isPreview?: boolean,
    addCallBack: (id: string) => void;
}

const PlaceCard: React.FC<PlaceCardDto> = ({id, name, photoUrl, isPreview = false, addCallBack}) => {
    const navigate = useNavigate();

    const redirectToPlaceDetails = () => {
        if (id) {
            navigate(`/places/${id}`);
        }
    };
    const handleAddition = () => {
        addCallBack(id as string);
    }

    return (
        <div className="card h-100">
            <img
                src={photoUrl}
                className="card-img-top"
                alt={name ?? 'Place image'}
                style={{height: '200px', objectFit: 'cover'}}
            />
            <div className="card-body d-flex flex-column">
                <h5 className="card-title">{name ?? 'Название не указано'}</h5>

                <div className="mt-auto d-flex justify-content-between">
                    <button
                        className="btn btn-sm btn-outline-primary"
                        onClick={redirectToPlaceDetails}
                        disabled={!id}
                    >
                        Подробнее
                    </button>
                    {!isPreview && (
                        <button className="btn btn-sm btn-success" onClick={handleAddition}>
                            Добавить
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

export default PlaceCard;