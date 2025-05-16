import React from "react";
import {Configuration, UserRoutesApi} from "../api";
import tryRefreshToken from "../Utils/tokenRefresher.ts";
import getAccessToken from "../Utils/getAcessToken.ts";
import {useNavigate} from "react-router-dom";

interface RouteRowProps {
    index: number;
    id: string;
    name: string;
    onDelete: (id: string) => void;
}

const RouteRow: React.FC<RouteRowProps> = ({ index, id, name, onDelete }) => {
    const navigate = useNavigate();
    const handleDelete = async () => {
        const config = new Configuration({
            accessToken: getAccessToken,
        });
        const api = new UserRoutesApi(config);
        try {
            await api.v1RoutesIdDelete({ id });
            onDelete(id)
            console.log("Маршрут удалён успешно");
        } catch (error: any) {
            console.error(error);
            if (error.response && error.response.status === 401) {
                await tryRefreshToken(error);
                await api.v1RoutesIdDelete({ id });
                onDelete(id)
                console.log("Маршрут удалён успешно");
            }
        }
    };
    const handleCheck = () => {
        navigate(`/routes/${id}`)
    }
    return (
        <tr>
            <th scope="row">{index}</th>
            <td>{name}</td>
            <td>
                <button type="button" className="btn btn-danger" onClick={handleDelete}>
                    Удалить
                </button>
            </td>
            <td>
                <button type="button" className="btn btn-primary" onClick={handleCheck}>
                    Редактировать
                </button>
            </td>
        </tr>
    );
};

export default RouteRow;
