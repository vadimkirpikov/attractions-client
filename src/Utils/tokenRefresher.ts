import {AuthApi} from "../api";

const tryRefreshToken = async (error: any) => {
    if (error.response && error.response.status === 401) {
        try {
            const authApi = new AuthApi();
            const requestInit: RequestInit = {
                credentials: "include"
            };

            const newToken = await authApi.v1AuthRefreshPost(requestInit);
            console.log("New", newToken.token);
            localStorage.setItem("token", newToken.token);
        }
        catch {
            console.error("Error getting token", error);
        }
    }
}
export default tryRefreshToken;