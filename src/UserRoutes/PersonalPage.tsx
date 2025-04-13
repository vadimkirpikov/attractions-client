import {RootState} from "../state/authSlice.ts";
import {useSelector} from "react-redux";
import {jwtDecode} from "jwt-decode";
import {useNavigate} from "react-router-dom";
import {useEffect, useState} from "react";
import RoutesTable from "./RoutesTable.tsx";

type UserInfo = {
    id: string;
    name: string;
    email: string;
}

const PersonalPage = () => {
    const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
    const navigate = useNavigate();
    const [userInf, setUserInf] = useState<UserInfo | null>(null);
    const extractUserId = () => {
        const token = localStorage.getItem('token');
        if (token) {
            const decodedToken: any = jwtDecode(token);
            console.log(decodedToken);
            const userInfo: UserInfo = {
                id: decodedToken["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"],
                name: decodedToken["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"],
                email: decodedToken["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress"]
            }
            setUserInf(userInfo);
        }
    }
    useEffect(() => {
        if (!isAuthenticated) {
            navigate("/login")
        }
        extractUserId()
    }, [])

    const redirectToCreation = () => {
        navigate("/create-route");
    }
    return (
        <>
            {isAuthenticated && (<div>
                <div>Имя: {userInf?.name}</div>
                <div>Email: {userInf?.email}</div>
                <RoutesTable />
                <button type="button" className="btn btn-primary" onClick={redirectToCreation}>Добавить маршрут</button>
            </div>)}
        </>
    )
}
export default PersonalPage;