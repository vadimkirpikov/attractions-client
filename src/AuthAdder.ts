export const addAuthHeaders = (options?: RequestInit) => {
    const token = localStorage.getItem('authToken');
    return {
        ...options,
        headers: {
            ...options?.headers,
            Authorization: token ? `Bearer ${token}` : '',
        },
    };
};
