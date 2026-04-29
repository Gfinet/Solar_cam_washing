import { useNavigate } from 'react-router-dom';



export const AppNavigation = () => {

    const navigate = useNavigate();

    const goToDash = () => navigate('/dashboard');
    const goToSchedule = () => navigate('/schedule');
    const goToTable = () => navigate('/table');
    const Logout = () =>  {
        localStorage.removeItem('isAuthenticated');
        localStorage.removeItem('username');
        navigate('/');
    };

    return {
        goToDash, 
        goToSchedule,
        goToTable,
        Logout,
    };
}
