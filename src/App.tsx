import {BrowserRouter as Router, Routes, Route} from "react-router-dom"
import LoginPage from "./AuthPages/LoginPage.tsx";
import React from "react";
import RegisterPage from "./AuthPages/RegisterPage.tsx";


const App: React.FC = () => {
    return (
        <Router>
            <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
            </Routes>
        </Router>
    )
}
export default App;
