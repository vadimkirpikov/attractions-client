import {BrowserRouter as Router, Routes, Route} from "react-router-dom"
import LoginPage from "./AuthPages/LoginPage.tsx";
import React from "react";
import RegisterPage from "./AuthPages/RegisterPage.tsx";
import PersonalPage from "./UserRoutes/PersonalPage.tsx";
import RoutePage from "./UserRoutes/RoutePage.tsx";
import CreateRoutePage from "./UserRoutes/CreateRoutePage.tsx";
import PlacePage from "./Places/PlacePage.tsx";


const App: React.FC = () => {
    return (
        <Router>
            <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/dashboard" element={<PersonalPage />} />
                <Route path="/create-route" element={<CreateRoutePage />} />
                <Route path="/routes/:id?" element={<RoutePage />} />
                <Route path="/place/:id" element={<PlacePage />}/>
            </Routes>
        </Router>
    )
}
export default App;
