import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.css';
import { Link, useNavigate } from 'react-router-dom';
import { AuthApi } from '../api/apis/AuthApi'; // путь к API клиенту
import { RegisterDto } from '../api/models'; // путь к моделям

const RegisterPage: React.FC = () => {
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [name, setName] = useState<string>('');
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    const handleForm = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        const api = new AuthApi(); // можно передать конфигурацию если нужно
        const registerDto: RegisterDto = { email, password, name };

        try {
            await api.v1AuthRegisterPost({ registerDto });
            navigate('/login');
        } catch (err: any) {
            setError('Ошибка регистрации. Проверьте введённые данные.');
            console.error(err);
        }
    };

    return (
        <div className="container d-flex justify-content-center align-items-center min-vh-100">
            <div className="row justify-content-center w-100">
                <div className="col-12 col-sm-8 col-md-6 col-lg-4">
                    <div className="card shadow-lg">
                        <div className="card-body p-4">
                            <h4 className="card-title text-center mb-4">Регистрация</h4>
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
                                    <label htmlFor="name" className="form-label">Имя</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        id="name"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="Введите ваше имя"
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

                                <button type="submit" className="btn btn-primary w-100">Регистрация</button>
                                <div className="text-center mt-2">
                                    <Link to="/login">Есть аккаунт? Войти</Link>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;
