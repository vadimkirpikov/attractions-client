import React, { useEffect, useState } from "react";
import { Category, Configuration, District, FilterDto, OthersApi } from "../api";
import getAccessToken from "../Utils/getAcessToken.ts";
import tryRefreshToken from "../Utils/tokenRefresher.ts";

interface FilterProps {
    onSubmit: (filterDto: FilterDto | undefined) => Promise<void>;
}

const Filter: React.FC<FilterProps> = ({ onSubmit }) => {
    const [filterDto, setFilterDto] = useState<FilterDto | undefined>({
        constMin: null,
        constMax: null,
        categoryIds: [],
        districtIds: [],
    });

    const [categories, setCategories] = useState<Array<Category>>([]);
    const [districts, setDistricts] = useState<Array<District>>([]);

    const handleSubmit = async () => {
        await onSubmit(filterDto);
    };

    const handleCheckboxChange = (
        id: string,
        type: "categoryIds" | "districtIds"
    ) => {
        if (!filterDto) return;

        const current = filterDto[type] || [];
        const updated = current.includes(id)
            ? current.filter((i) => i !== id)
            : [...current, id];

        setFilterDto({ ...filterDto, [type]: updated });
    };

    const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFilterDto((prev) => ({
            ...prev,
            [name]: value ? parseInt(value) : undefined,
        }));
    };

    useEffect(() => {
        const fetchOthers = async () => {
            const config = new Configuration({
                accessToken: getAccessToken,
            });
            const api = new OthersApi(config);

            const apiGetUtils = async () => {
                const categs = await api.v1CategoriesGet();
                setCategories(categs);
                const dists = await api.v1DistrictsGet();
                setDistricts(dists);
            };

            try {
                await apiGetUtils();
            } catch (error: any) {
                if (error.response && error.response.status === 401) {
                    await tryRefreshToken(error);
                    await apiGetUtils();
                }
            }
        };
        fetchOthers();
    }, []);

    return (
        <div>
            <div className="flex-row justify-content-between">
                <div className="flex-col">
                    <label>Минимальная стоимость</label>
                    <input
                        type="number"
                        name="minPrice"
                        value={filterDto?.constMin || ""}
                        onChange={handlePriceChange}
                        className="form-control"
                    />
                </div>
                <div className="flex-col">
                    <label>Максимальная стоимость</label>
                    <input
                        type="number"
                        name="maxPrice"
                        value={filterDto?.constMax || ""}
                        onChange={handlePriceChange}
                        className="form-control"
                    />
                </div>
            </div>

            <h3>Категории</h3>
            <div className="flex-col">
                {categories.map((category) => (
                    <div style={{display: "flex"}} key={category.id}>
                        <input
                            type="checkbox"
                            className="form-check"
                            value={category.id}
                            checked={filterDto?.categoryIds?.includes(category.id as string)}
                            onChange={() => handleCheckboxChange(category.id as string, "categoryIds")}
                        />
                        <label>{category.name}</label>

                    </div>
                ))}
            </div>

            <h3>Районы</h3>
            <div className="flex-col">
                {districts.map((district) => (
                    <div style={{display: "flex"}} key={district.id}>
                        <input
                            type="checkbox"
                            className="form-check"
                            value={district.id}
                            checked={filterDto?.districtIds?.includes(district.id as string)}
                            onChange={() => handleCheckboxChange(district.id as string, "districtIds")}
                        />
                        <label>{district.name}</label>
                    </div>
                ))}
            </div>

            <button className="btn btn-primary" onClick={handleSubmit}>
                Применить
            </button>
        </div>
    );
};

export default Filter;
