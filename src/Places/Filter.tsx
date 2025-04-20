import React, {useEffect, useState} from "react";
import {Category, Configuration, District, FilterDto, OthersApi} from "../api";
import getAccessToken from "../Utils/getAcessToken.ts";
import tryRefreshToken from "../Utils/tokenRefresher.ts";

interface FilterProps {
    onSubmit: (filterDto?: FilterDto | null) => Promise<void>;
}

const Filter: React.FC<FilterProps> = ({ onSubmit }) => {
    const [filterDto, setFilterDto] = useState<FilterDto | null | undefined>({});
    const [categories, setCategories] = useState<Array<Category>>([]);
    const [districts, setDistricts] = useState<Array<District>>([]);

    const handleSubmit = async () => {
        await onSubmit(filterDto);
    }
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
            <div className={"flex-row justify-content-between"}>
                <div className={"flex-col"}>
                    <label>Минимальная стоимость</label>
                    <input type={"number"} className={"form-control"}/>
                </div>
                <div className={"flex-col"}>
                    <label>Максимальная стоимость</label>
                    <input type={"number"} className={"form-control"}/>
                </div>
            </div>
            <h3>Категории</h3>
            <div className={"flex-col"}>
                {categories.length > 0 && (
                    <>
                        {categories.map((category) => (
                            <input type={"checkbox"} className={"form-control"} value={category.id}/>
                        ))}
                    </>
                )}
            </div>
            <h3>Районы</h3>
            <div className={"flex-col"}>
                {categories.length > 0 && (
                    <>
                        {categories.map((category) => (
                            <input type={"checkbox"} className={"form-control"} value={category.id}/>
                        ))}
                    </>
                )}
            </div>
        </div>
    )
}

export default Filter;