import {useNavigate} from "react-router-dom";
import {useEffect, useState} from "react";
import {Configuration, UserRouteDto, UserRoutesApi} from "../api";
import getAccessToken from "../Utils/getAcessToken.ts";
import tryRefreshToken from "../Utils/tokenRefresher.ts";
import {useSelector} from "react-redux";
import {RootState} from "../state/authSlice.ts";

const CreateRoutePage = () => {
    const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
    const navigate = useNavigate();
    const [route, setRoute] = useState<UserRouteDto>();
    const [message, setMessage] = useState<string | null>(null);
    const [isError, setIsError] = useState<boolean>(false);

    if (!isAuthenticated) {
        navigate("/login");
    }
    const handleCreate = async () => {
        const config = new Configuration({
            accessToken: getAccessToken,
        });

        const routesApi = new UserRoutesApi(config)

        try {
            await routesApi.v1RoutesPost({ userRouteDto: route });
            setMessage("Маршрут успешно создан!");
            setIsError(false);
        } catch (error: any) {
            console.error(error);
            if (error.response && error.response.status === 401) {
                try {
                    await tryRefreshToken(error);
                    await routesApi.v1RoutesPost({ userRouteDto: route });
                    setMessage("Маршрут успешно создан после обновления токена.");
                    setIsError(false);
                } catch (refreshError) {
                    setMessage("Ошибка при обновлении токена.");
                    setIsError(true);
                }
            } else {
                setMessage("Произошла ошибка при создании маршрута.");
                setIsError(true);
            }
        }
    };
    useEffect(() => {
        if (message) {
            const timeout = setTimeout(() => setMessage(null), 3000);
            return () => clearTimeout(timeout);
        }
    }, [message]);

    const handleNameChange = (name: string) => {
        setRoute((prev) => ({
            ...prev,
            name: name
        }));
    };

    const redirectToDashboard = () => {
        navigate("/dashboard");
    }


    return (
        <>
            <input className="form-control form-control-lg w-50" type="text" placeholder=".form-control-lg"
                   aria-label=".form-control-lg example" onChange={event => handleNameChange(event.target.value)}/>
            {message && (
                <div className={`alert ${isError ? 'alert-danger' : 'alert-success'} mt-3 w-50`}>
                    {message}
                </div>
            )}

            <button className="btn btn-primary" onClick={handleCreate}>Добавить</button>
            <button className="btn btn-primary" onClick={redirectToDashboard}>На главную</button>
        </>
    )
}
export default CreateRoutePage;