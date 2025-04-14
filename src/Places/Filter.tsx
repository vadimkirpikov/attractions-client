import React, {useEffect, useState} from "react";
import {Category, Configuration, District, FilterDto, OthersApi} from "../api";
import getAccessToken from "../Utils/getAcessToken.ts";
import tryRefreshToken from "../Utils/tokenRefresher.ts";

interface FilterProps {
    onSubmit: (filterDto?: FilterDto) => Promise<void>;
}

const Filter: React.FC<FilterProps> = ({ onSubmit }) => {
    const [filterDto, setFilterDto] = useState<FilterDto | null>(null);
    const [categories, setCategories] = useState<Array<Category>>([]);
    const [districts, setDistricts] = useState<Array<District>>([]);

    useEffect(() => {
        const fetchOthers = async () => {
            const config = new Configuration({
                accessToken: getAccessToken,
            });
            const api = new OthersApi(config);
            const apiGetUtils = async () => {
                const categs = await api.v1CategoriesGet();
                setCategories(categs);
                const districts = await api.v1DistrictsGet();
                setDistricts(districts);
            }
            try {
                await apiGetUtils();
            }
            catch (error: any) {
                if (error.response && error.response.status === 401) {
                    await tryRefreshToken(error);
                    await apiGetUtils()
                }
            }
        }
        fetchOthers()
    }, [])
    return (
        <div>

        </div>
    )
}