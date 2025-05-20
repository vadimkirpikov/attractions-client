import { useSelector } from "react-redux";
import { RootState } from "../state/authSlice";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Configuration, OthersApi, User } from "../api";
import getAccessToken from "../Utils/getAcessToken";
import tryRefreshToken from "../Utils/tokenRefresher";

const AuthPage = () => {
    const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
    const navigate = useNavigate();
    const [users, setUsers] = useState<Array<User>>([]);
    const [isError, setIsError] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    useEffect(() => {
        const fetchUsers = async () => {
            const config = new Configuration({
                accessToken: getAccessToken,
            });
            const api = new OthersApi(config);

            try {
                const users = await api.v1UsersGet();
                setUsers(users);
            } catch (error: any) {
                console.error(error);
                if (error.response?.status === 401) {
                    try {
                        await tryRefreshToken(error);
                        const retriedUsers = await api.v1UsersGet();
                        setUsers(retriedUsers);
                    } catch {
                        navigate("/login");
                    }
                } else if (error.response?.status === 403) {
                    setIsError(true);
                }
            } finally {
                setIsLoading(false);
            }
        };

        if (isAuthenticated) {
            fetchUsers();
        } else {
            navigate("/login");
        }
    }, [isAuthenticated, navigate]);

    if (isLoading) {
        return (
            <div className="container mt-5 text-center">
                <div className="spinner-border" role="status">
                    <span className="visually-hidden">Загрузка...</span>
                </div>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="container mt-5">
                <div className="alert alert-danger" role="alert">
                    У вас нет доступа к этой информации.
                </div>
            </div>
        );
    }

    return (
        <div className="container mt-5">
            <h2 className="mb-4">Список пользователей</h2>
            {users.length === 0 ? (
                <div className="alert alert-info">Нет доступных пользователей.</div>
            ) : (
                <div className="table-responsive">
                    <table className="table table-bordered table-hover">
                        <thead className="table-light">
                        <tr>
                            <th>ID</th>
                            <th>Имя</th>
                            <th>Email</th>
                            <th>Роль</th>
                        </tr>
                        </thead>
                        <tbody>
                        {users.map((user) => (
                            <tr key={user.id}>
                                <td>{user.id}</td>
                                <td>{user.name || "—"}</td>
                                <td>{user.email || "—"}</td>
                                <td>{user.role || "—"}</td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default AuthPage;
