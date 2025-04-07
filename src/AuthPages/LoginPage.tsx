import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.css';
import {Link} from "react-router-dom";

const LoginPage: React.FC = () => {
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');

    const handleForm = (e: React.FormEvent) => {
        e.preventDefault();
        console.log(email, password);
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
                                    <label htmlFor="email" className="form-label">
                                        Email адрес
                                    </label>
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
                                    <label htmlFor="password" className="form-label">
                                        Пароль
                                    </label>
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
                                <button type="submit" className="btn btn-primary w-100">
                                    Войти
                                </button>
                                <Link to={"/register"}>
                                    Нет аккаунта? Зарегистрироваться
                                </Link>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
