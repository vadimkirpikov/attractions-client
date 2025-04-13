const getAccessToken = () => {
    const token = localStorage.getItem('token');
    console.log(token)
    if (token) {
        return token;
    } else {
        throw new Error("Token not found in localStorage");
    }
};

export default getAccessToken;