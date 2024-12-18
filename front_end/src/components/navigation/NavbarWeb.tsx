import React, { useEffect } from 'react';
import { Container, Nav, Navbar, Dropdown } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../../store/store';
import { logoutUser } from '../../api/auth/authThunks';
import { fetchPaginatedVacations, fetchVacations } from '../../api/vactions/vacationsThunk';
import "../../css/navbar.css";


const NavbarWeb: React.FC = () => {
    const { status, user } = useSelector((state: RootState) => state.auth);
    const { vacations } = useSelector((state: RootState) => state.vacation);
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();

    useEffect(() => {
        if (user?.isAdmin) {
            if (vacations.length === 0) dispatch(fetchVacations({ token: user.token })); // Fetch all vacations for dropdown
        }

    }, [user, dispatch, vacations.length]);

    const handleLogout = () => {
        if (window.confirm('Are you sure you want to logout?')) {
            dispatch(logoutUser());
            navigate('/login');
        }
    };

    const handleEditVacation = (vacationId: number) => {
        navigate(`/edit-vacation/${vacationId}`);
    };

    const isLoggedIn = status === 'succeeded' && user !== null;
    const isAdmin = Boolean(user?.isAdmin); // Converts 0 to false, 1 to true


    if (!isLoggedIn || !user) return null;
 
    return (
        <Navbar className="navbar-lilac" variant="light">
            <Container>
                <Navbar.Brand as={Link} to={isLoggedIn ? "/vacations" : "/login"}>
                    {isLoggedIn ? 'Vacations' : 'Login'}
                </Navbar.Brand>
                <Nav className="me-auto">
                    {isLoggedIn && (
                        <>
                            {isAdmin && (
                                <>
                                    <Nav.Link as={Link} to="/add-vacation">Add Vacation</Nav.Link>
                                    <Nav.Link as={Link} to="/report">Report</Nav.Link>
                                    <Dropdown>     <Dropdown.Toggle className="dropdown-toggle-white" id="dropdown-basic">
                                        Edit Vacation
                                    </Dropdown.Toggle>


                                        <Dropdown.Menu className="custom-dropdown-menu">
                                            {vacations.map(vacation => (
                                                <Dropdown.Item
                                                    key={vacation.id || `vacation-${vacation.destination}`} // ensure uniqueness
                                                    onClick={() => {
                                                        if (vacation.id !== undefined) {
                                                            handleEditVacation(vacation.id);
                                                        }
                                                    }}
                                                >
                                                    {vacation.destination}
                                                </Dropdown.Item>
                                            ))}
                                        </Dropdown.Menu>
                                    </Dropdown>
                                </>
                            )}
                            <Nav.Link as="button" onClick={handleLogout}>Logout</Nav.Link>
                        </>
                    )}
                    {!isLoggedIn && (
                        <Nav.Link as={Link} to="/register">A New User?</Nav.Link>
                    )}
                </Nav>
                {isLoggedIn && user && (
                    <Nav className="ms-auto">
                        <Nav.Item>
                            <span className="navbar-text">Hello, {`${user.firstName} ${user.lastName}`}!</span>
                        </Nav.Item>
                    </Nav>
                )}
            </Container>
        </Navbar>
    );
};

export default NavbarWeb;
