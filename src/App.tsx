import {BrowserRouter as Router, Routes, Route, useNavigate} from "react-router-dom"
import LoginPage from "./AuthPages/LoginPage.tsx";
import React from "react";
import RegisterPage from "./AuthPages/RegisterPage.tsx";
import PersonalPage from "./UserRoutes/PersonalPage.tsx";
import RoutePage from "./UserRoutes/RoutePage.tsx";
import CreateRoutePage from "./UserRoutes/CreateRoutePage.tsx";
import PlacePage from "./Places/PlacePage.tsx";
import PlaceList from "./Places/PlaceList.tsx";

const Redirector: React.FC = () => {
    const navigator = useNavigate();
    navigator("/login")
    return (<></>)
}
const App: React.FC = () => {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Redirector />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/dashboard" element={<PersonalPage />} />
                <Route path="/create-route" element={<CreateRoutePage />} />
                <Route path="/routes/:id?" element={<RoutePage />} />
                <Route path="/places" element={<PlaceList exceptIds={[]} additionCallBack={undefined} isPreview={true} />}/>
                <Route path="/places/:id" element={<PlacePage />}/>

            </Routes>
        </Router>
    )
}
export default App;
