import React, { useEffect, useState } from "react";
import { Category, Configuration, District, FilterDto, OthersApi } from "../api";
import getAccessToken from "../Utils/getAcessToken.ts";
import tryRefreshToken from "../Utils/tokenRefresher.ts";

interface FilterProps {
    onSubmit: (filterDto: FilterDto | undefined) => Promise<void>;
}

const Filter: React.FC<FilterProps> = ({ onSubmit }) => {
    // Keep existing state and logic
    const [filterDto, setFilterDto] = useState<FilterDto | undefined>({
        constMin: null,
        constMax: null,
        categoryIds: [],
        districtIds: [],
    });
    const [categories, setCategories] = useState<Array<Category>>([]);
    const [districts, setDistricts] = useState<Array<District>>([]);

    const handleSubmit = async () => {
        // Prepare the DTO: ensure empty arrays if nothing is selected,
        // and convert price strings back to numbers (or null/undefined).
        const dtoToSend: FilterDto = {
            constMin: filterDto?.constMin ? Number(filterDto.constMin) : null,
            constMax: filterDto?.constMax ? Number(filterDto.constMax) : null,
            categoryIds: filterDto?.categoryIds ?? [],
            districtIds: filterDto?.districtIds ?? [],
        };
        // Ensure empty arrays are not submitted if undefined was intended by API
        // Adjust this based on how your API handles empty filters vs null filters
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
        // Store price as string temporarily to allow empty input, convert on submit
        // Or handle parsing directly, ensuring NaN is handled
        setFilterDto((prev) => ({
            ...prev!,
            // Use name attribute directly matching FilterDto keys
            [name]: value === '' ? null : value // Store as string or null
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
                    // Handle specific errors if needed
                    if (error.response && error.response.status === 401) {
                        console.log("Attempting token refresh for categories/districts fetch...");
                        await tryRefreshToken(error); // Assuming tryRefreshToken returns boolean or throws
                        const [categs, dists] = await Promise.all([
                            api.v1CategoriesGet(),
                            api.v1DistrictsGet()
                        ]);
                        setCategories(categs ?? []);
                        setDistricts(dists ?? []);
                    } else {
                        // Handle other errors (network, server error, etc.)
                        console.error("An unexpected error occurred:", error);
                    }
                }
            };
            await apiGetUtils(); // Call the function
        };
        fetchOthers();
    }, []); // Empty dependency array means this runs once on mount

    return (
        // Use Bootstrap Card for visual grouping
        <div className="card sticky-top" style={{ top: '20px' }}> {/* sticky-top makes it stay visible on scroll */}
            <div className="card-body">
                <h5 className="card-title mb-3">Фильтры</h5>

                {/* Price Range */}
                <div className="mb-3">
                    <label htmlFor="constMin" className="form-label">Минимальная стоимость</label>
                    <input
                        type="number"
                        id="constMin"
                        name="constMin" // Match state key
                        value={filterDto?.constMin ?? ""} // Use ?? for null/undefined
                        onChange={handlePriceChange}
                        className="form-control form-control-sm" // Smaller input
                        min="0" // Basic validation
                    />
                </div>
                <div className="mb-3">
                    <label htmlFor="constMax" className="form-label">Максимальная стоимость</label>
                    <input
                        type="number"
                        id="constMax"
                        name="constMax" // Match state key
                        value={filterDto?.constMax ?? ""} // Use ?? for null/undefined
                        onChange={handlePriceChange}
                        className="form-control form-control-sm" // Smaller input
                        min="0" // Basic validation
                    />
                </div>

                {/* Categories */}
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

                {/* Districts */}
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