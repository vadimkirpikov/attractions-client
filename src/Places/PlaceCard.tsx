import React from "react"; // Import React
import { useNavigate } from "react-router-dom";

interface PlaceCardDto {
    id?: string | null,
    name?: string | null,
    photoUrl: string,
    isPreview?: boolean,
}

// Use React.FC for functional components with props typing
const PlaceCard: React.FC<PlaceCardDto> = ({ id, name, photoUrl, isPreview = false }) => {
    const navigate = useNavigate();

    const redirectToPlaceDetails = () => {
        if (id) { // Only navigate if ID exists
            navigate(`/places/${id}`);
        }
    };

    return (
        // Use Bootstrap card structure
        <div className="card h-100"> {/* h-100 helps align cards in a row */}
            {/* Use card-img-top for image placement */}
            <img
                src={photoUrl}
                className="card-img-top"
                alt={name ?? 'Place image'} // Provide alt text
                style={{ height: '200px', objectFit: 'cover' }} // Add some basic image styling
            />
            <div className="card-body d-flex flex-column"> {/* flex-column + mt-auto for button alignment */}
                {/* Use card-title for the name */}
                <h5 className="card-title">{name ?? 'Название не указано'}</h5>
                {/* Add some placeholder description if needed */}
                {/* <p className="card-text">Some quick example text.</p> */}

                {/* Buttons container */}
                {/* mt-auto pushes buttons to the bottom if card body is flex-column */}
                <div className="mt-auto d-flex justify-content-between">
                    <button
                        className="btn btn-sm btn-outline-primary" // Smaller, outlined button
                        onClick={redirectToPlaceDetails}
                        disabled={!id} // Disable if no ID
                    >
                        Подробнее
                    </button>
                    {!isPreview && (
                        <button className="btn btn-sm btn-success"> {/* Smaller, success color */}
                            Добавить
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

export default PlaceCard;