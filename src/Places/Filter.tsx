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
        const dtoToSend: FilterDto = {
            constMin: filterDto?.constMin ? Number(filterDto.constMin) : null,
            constMax: filterDto?.constMax ? Number(filterDto.constMax) : null,
            categoryIds: filterDto?.categoryIds ?? [],
            districtIds: filterDto?.districtIds ?? [],
        };
        await onSubmit(dtoToSend);
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

        setFilterDto((prev) => ({ ...prev!, [type]: updated }));
    };

    const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFilterDto((prev) => ({
            ...prev!,
            [name]: value === '' ? null : value
        }));
    };

    useEffect(() => {
        const fetchOthers = async () => {
            const config = new Configuration({
                accessToken: getAccessToken,
            });
            const api = new OthersApi(config);

            const apiGetUtils = async () => {
                try {
                    const [categs, dists] = await Promise.all([
                        api.v1CategoriesGet(),
                        api.v1DistrictsGet()
                    ]);
                    setCategories(categs ?? []);
                    setDistricts(dists ?? []);
                } catch (error: any) {
                    console.error("Failed to fetch categories/districts:", error);
                    if (error.response && error.response.status === 401) {
                        console.log("Attempting token refresh for categories/districts fetch...");
                        await tryRefreshToken(error);
                        const [categs, dists] = await Promise.all([
                            api.v1CategoriesGet(),
                            api.v1DistrictsGet()
                        ]);
                        setCategories(categs ?? []);
                        setDistricts(dists ?? []);
                    } else {
                        console.error("An unexpected error occurred:", error);
                    }
                }
            };
            await apiGetUtils();
        };
        fetchOthers();
    }, []);

    return (
        <div className="card sticky-top" style={{ top: '20px' }}>
            <div className="card-body">
                <h5 className="card-title mb-3">Фильтры</h5>
                <div className="mb-3">
                    <label htmlFor="constMin" className="form-label">Минимальная стоимость</label>
                    <input
                        type="number"
                        id="constMin"
                        name="constMin"
                        value={filterDto?.constMin ?? ""}
                        onChange={handlePriceChange}
                        className="form-control form-control-sm"
                        min="0"
                    />
                </div>
                <div className="mb-3">
                    <label htmlFor="constMax" className="form-label">Максимальная стоимость</label>
                    <input
                        type="number"
                        id="constMax"
                        name="constMax"
                        value={filterDto?.constMax ?? ""}
                        onChange={handlePriceChange}
                        className="form-control form-control-sm"
                        min="0"
                    />
                </div>

                <div className="mb-3">
                    <h6>Категории</h6>
                    {categories.length > 0 ? categories.map((category) => (
                        <div className="form-check" key={category.id}>
                            <input
                                type="checkbox"
                                className="form-check-input"
                                id={`category-${category.id}`}
                                value={category.id}
                                checked={filterDto?.categoryIds?.includes(category.id as string) ?? false}
                                onChange={() => handleCheckboxChange(category.id as string, "categoryIds")}
                            />
                            <label className="form-check-label" htmlFor={`category-${category.id}`}>
                                {category.name}
                            </label>
                        </div>
                    )) : <small className="text-muted">Категории не найдены.</small>}
                </div>
                <div className="mb-3">
                    <h6>Районы</h6>
                    {districts.length > 0 ? districts.map((district) => (
                        <div className="form-check" key={district.id}>
                            <input
                                type="checkbox"
                                className="form-check-input"
                                id={`district-${district.id}`}
                                value={district.id}
                                checked={filterDto?.districtIds?.includes(district.id as string) ?? false}
                                onChange={() => handleCheckboxChange(district.id as string, "districtIds")}
                            />
                            <label className="form-check-label" htmlFor={`district-${district.id}`}>
                                {district.name}
                            </label>
                        </div>
                    )) : <small className="text-muted">Районы не найдены.</small>}
                </div>

                <button className="btn btn-primary w-100" onClick={handleSubmit}>
                    Применить
                </button>
            </div>
        </div>
    );
};

export default Filter;