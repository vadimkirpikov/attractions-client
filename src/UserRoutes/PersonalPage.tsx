import {RootState} from "../state/authSlice.ts";
import {useSelector} from "react-redux";
import {jwtDecode} from "jwt-decode";
import {useNavigate} from "react-router-dom";
import {useEffect, useState} from "react";
import RoutesTable from "./RoutesTable.tsx";
import 'bootstrap/dist/css/bootstrap.min.css';
type UserInfo = {
    id: string;
    name: string;
    email: string;
}
const PersonalPage = () => {
    const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
    const navigate = useNavigate();
    const [userInf, setUserInf] = useState<UserInfo | null>(null);
    const extractUserInfo = () => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const decodedToken: any = jwtDecode(token);
                const userInfo: UserInfo = {
                    id: decodedToken["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"],
                    name: decodedToken["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"],
                    email: decodedToken["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress"]
                }
                setUserInf(userInfo);
            } catch (error) {
                console.error("Error decoding token:", error);
                localStorage.removeItem('token');
            }
        } else {
            if (isAuthenticated) {
                console.warn("Redux state is authenticated, but no token found in localStorage.");
            }
        }
    }
    useEffect(() => {
        if (!isAuthenticated) {
            navigate("/login");
        } else {
            if (!userInf) {
                extractUserInfo();
            }
        }
    }, [isAuthenticated, navigate, userInf]);
    const redirectToCreation = () => {
        navigate("/create-route");
    }
    if (!isAuthenticated) {
        return null;
    }
    return (
        <div className="container mt-4 mb-5">
            <div className="pb-3 mb-4 border-bottom">
                <h1 className="h2">Личный кабинет</h1>
            </div>
            {userInf && (
                <div className="card shadow-sm mb-4">
                    <div className="card-header bg-light">
                        <h5 className="my-0 fw-normal">Информация о пользователе</h5>
                    </div>
                    <div className="card-body">
                        <div className="row">
                            <div className="col-md-3 text-muted">
                                <p className="mb-1"><strong>Имя пользователя:</strong></p>
                            </div>
                            <div className="col-md-9">
                                <p className="mb-1">{userInf.name ||
                                    <span className="text-muted fst-italic">Не указано</span>}</p>
                            </div>
                        </div>
                        <hr className="my-2"/>
                        <div className="row">
                            <div className="col-md-3 text-muted">
                                <p className="mb-1"><strong>Email:</strong></p>
                            </div>
                            <div className="col-md-9">
                                <p className="mb-1">{userInf.email ||
                                    <span className="text-muted fst-italic">Не указан</span>}</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            <div className="mb-4">
                <div className="d-flex justify-content-between align-items-center mb-3">
                    <h2 className="h4 mb-0">Мои маршруты</h2>
                    <button
                        type="button"
                        className="btn btn-primary btn-md"
                        onClick={redirectToCreation}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor"
                             className="bi bi-plus-lg me-1" viewBox="0 0 16 16">
                            <path fillRule="evenodd"
                                  d="M8 2a.5.5 0 0 1 .5.5v5h5a.5.5 0 0 1 0 1h-5v5a.5.5 0 0 1-1 0v-5h-5a.5.5 0 0 1 0-1h5v-5A.5.5 0 0 1 8 2Z"/>
                        </svg>
                        Добавить маршрут
                    </button>
                </div>
                <div className="card shadow-sm">
                    <div className="card-body p-0">
                        <RoutesTable/>
                    </div>
                </div>
            </div>
            {!userInf && isAuthenticated && (
                <div className="alert alert-warning" role="alert">
                    Загрузка информации о пользователе... Если это сообщение не исчезает, попробуйте обновить страницу.
                </div>
            )}        </div>
    );
}
export default PersonalPage;