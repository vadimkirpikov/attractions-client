import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.css';
import { Link } from 'react-router-dom';
import { AuthApi } from '../api'; // путь к API клиенту
import { LoginDto } from '../api'; // путь к моделям
import { useDispatch } from 'react-redux';
import { AppDispatch} from "../state/authSlice.ts";
import {login} from "../state/store.ts";
import {useNavigate} from "react-router-dom";

const LoginPage: React.FC = () => {
    const [email, setEmail] = useState<string>('');
    const dispatch = useDispatch<AppDispatch>();
    const [password, setPassword] = useState<string>('');
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    const handleForm = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        const api = new AuthApi();
        const loginDto: LoginDto = { email, password };

        try {
            const requestInit: RequestInit = {
                credentials: "include"
            };

            const token = await api.v1AuthLoginPost({ loginDto }, requestInit);
            dispatch(login(token.token))
            navigate("/dashboard");
        } catch (err: any) {
            setError('Ошибка входа. Проверьте введённые данные.');
            console.error(err);
        }
    };

    return (
        <div className="container d-flex justify-content-center align-items-center min-vh-100">
            <div className="row justify-content-center w-100">
                <div className="col-12 col-sm-8 col-md-6 col-lg-4">
                    <div className="card shadow-lg">
                        <div className="card-body p-4">
                            <h4 className="card-title text-center mb-4">Вход</h4>
                            <form onSubmit={handleForm}>
                                <div className="mb-3">
                                    <label htmlFor="email" className="form-label">Email адрес</label>
                                    <input
                                        type="email"
                                        className="form-control"
                                        id="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="Введите ваш email"
                                        required
                                    />
                                </div>
                                <div className="mb-3">
                                    <label htmlFor="password" className="form-label">Пароль</label>
                                    <input
                                        type="password"
                                        className="form-control"
                                        id="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="Введите ваш пароль"
                                        required
                                    />
                                </div>

                                {error && <div className="alert alert-danger">{error}</div>}

                                <button type="submit" className="btn btn-primary w-100">Войти</button>
                                <div className="text-center mt-2">
                                    <Link to="/register">Нет аккаунта? Зарегистрироваться</Link>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
