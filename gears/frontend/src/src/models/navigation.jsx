import { useNavigate } from 'react-router-dom';



export const AppNavigation = () => {

    const navigate = useNavigate();

    const goToDash = () => navigate('/dashboard');
    const goToSchedule = () => navigate('/schedule');
    const goToTable = () => navigate('/table');
    const goToCams = () => navigate('/cams');
    const Logout = () =>  {
        localStorage.removeItem('token');
        navigate('/');
    };

    return {
        goToDash, 
        goToSchedule,
        goToTable,
        goToCams,
        Logout,
    };
}
