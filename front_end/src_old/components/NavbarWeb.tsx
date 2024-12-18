import React, { useEffect } from 'react';
import { Container, Nav, Navbar } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../store/store';
import { logoutUser } from '../api/authThunks';
import { UserModel } from '../model/UserModel';

const NavbarWeb: React.FC = () => {
    const { status, user } = useSelector((state: RootState) => state.auth);
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();

    useEffect(() => {
        console.log('Current user:', user);
        console.log('Is admin?', user?.isAdmin);
    }, [user]);

    const handleLogout = () => {
        if (window.confirm('Are you sure you want to logout?')) {
            dispatch(logoutUser());
            navigate('/login');
        }
    };

    const isLoggedIn = status === 'succeeded';
    const isAdmin = isLoggedIn && user?.isAdmin;
    
    return (
        <Navbar className="navbar-lilac" variant="light">
            <Container>
                <Navbar.Brand as={Link} to={isLoggedIn ? "/vacations" : "/login"}>
                    {isLoggedIn ? 'Vacations' : 'Login'}
                </Navbar.Brand>
                <Nav className="me-auto">
                    {isLoggedIn && (
                        <>
                            {isAdmin && <Nav.Link as={Link} to="/add-vacation">Add Vacation</Nav.Link>}
                            <Nav.Link as="button" onClick={handleLogout}>Logout</Nav.Link>
                        </>
                    )}
                    {!isLoggedIn && (
                        <Nav.Link as={Link} to="/register">A New User?</Nav.Link>
                    )}
                </Nav>
            </Container>
        </Navbar>
    );
};

export default NavbarWeb;
