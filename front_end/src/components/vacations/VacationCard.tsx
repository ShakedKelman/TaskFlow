import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import Card from 'react-bootstrap/Card';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import 'bootstrap/dist/css/bootstrap.min.css';
import { VacationModel } from '../../model/VacationModel';
import { siteConfig } from '../../utils/SiteConfig';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import FavoriteIcon from '@mui/icons-material/Favorite';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { selectUser } from '../../store/slices/authSlice';
import { deleteVacationAPI } from '../../api/vactions/vactions-api';
import '../../css/vacationCard.css';
import { addVacationFollower, removeVacationFollower } from '../../api/followers/followersThunk';
import { getFollowersForVacation } from '../../api/followers/follower-api';
import { getImageForVacation } from '../../api/images/images-api';
import { selectFollowers } from '../../store/slices/followersSlice';
import { AppDispatch, RootState } from '../../store/store';
import { deleteVacationAction, updateVacationFollowerInfo } from '../../store/slices/vacationslice';

const formatDate = (isoDate: string): string => {
    const date = new Date(isoDate);
    const day = date.getUTCDate().toString().padStart(2, '0');
    const month = (date.getUTCMonth() + 1).toString().padStart(2, '0');
    const year = date.getUTCFullYear().toString().slice(-2);
    return `${day}/${month}/${year}`;
};


interface VacationCardProps {
    vacation: VacationModel;
   
}

const VacationCard: React.FC<VacationCardProps> = ({ vacation }) => {
    const { user, token } = useSelector((state: RootState) => state.auth);
    const [images, setImages] = useState<string[]>([]);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();
    const dispatch = useDispatch<AppDispatch>();


        useEffect(() => {
            const fetchImages = async () => {
                if (!vacation.id || !token) return;
    
                try {
                    const vacationImages = await getImageForVacation(vacation.id);
                    setImages(vacationImages);
                } catch (error) {
                    console.error('Error fetching images:', error);
                }
            };
    
            fetchImages();
        }, [vacation.id, token]);


    const handleFollowClick = async () => {
        if (!user?.id || !vacation.id || !token) {
            setError('User or Vacation ID or token is missing');
            return;
        }

        try {
            const currentFollowerCount = vacation.followerCount || 0; // Provide default value

            if (vacation.isFollowing) {
                await dispatch(removeVacationFollower({
                    userId: user.id,
                    vacationId: vacation.id,
                    token
                })).unwrap();
                
                // Update both slices with a single action
                dispatch(updateVacationFollowerInfo({
                    vacationId: vacation.id,
                    followerCount: Math.max(currentFollowerCount - 1, 0), // Ensure non-negative
                    isFollowing: false
                }));
            } else {
                await dispatch(addVacationFollower({
                    userId: user.id,
                    vacationId: vacation.id,
                    token
                })).unwrap();
                
                // Update both slices with a single action
            dispatch(updateVacationFollowerInfo({
                vacationId: vacation.id,
                followerCount: currentFollowerCount + 1,
                isFollowing: true
                }));
            }
            setError(null);
        } catch (error) {
            setError('Failed to update follower status');
            console.error('Error updating follower:', error);
        }
    };

    const handleEditVacation = () => {
        navigate(`/edit-vacation/${vacation.id}`);
    };

    const handleDeleteVacation = async () => {
        if (!vacation.id || !token) {
            setError('Vacation ID or token is missing');
            return;
        }

  

        if (window.confirm('Are you sure you want to delete this vacation?')) {
            try {
                // First make the API call
                await deleteVacationAPI(vacation.id, token);
                // Then update Redux state
                dispatch(deleteVacationAction(vacation.id));
            } catch (error) {
                setError('Failed to delete vacation');
                console.error('Error deleting vacation:', error);
            }
        }
    };
    return (
        <div>
            <Row>
                <Col md={8} className="mb-4">
                    <Card className="vacation-card">
                        <div className="vacation-card-img-container">
                            <Card.Img
                                className="vacation-card-img"
                                variant="top"
                                src={`${siteConfig.BASE_URL}images/${vacation.id}`}
                                alt={vacation.destination}
                            />
                            <Card.Title className="vacation-card-title">{vacation.destination}</Card.Title>
                        </div>
                        <Card.Body className="vacation-card-body">
                            <div className="vacation-card-text">
                                <p>{vacation.description}</p>
                                <p>{`Start Date: ${formatDate(vacation.startDate)}`}</p>
                                <p>{`End Date: ${formatDate(vacation.endDate)}`}</p>
                                <div className="vacation-card-price">{`Price: $${vacation.price}`}</div>

                                {!user?.isAdmin ? (
                                    <div className="vacation-card-favorites">
                                        {vacation.isFollowing ? (
                                            <FavoriteIcon
                                                style={{ marginRight: '5px', cursor: 'pointer', color: 'red' }}
                                                onClick={handleFollowClick}
                                            />
                                        ) : (
                                            <FavoriteBorderIcon
                                                style={{ marginRight: '5px', cursor: 'pointer', color: 'gray' }}
                                                onClick={handleFollowClick}
                                            />
                                        )}
                                        <span>{vacation.followerCount}</span>
                                        {user && vacation.isFollowing && (
                                            <span className="following" style={{ marginLeft: '10px' }}>
                                                You follow this vacation
                                            </span>
                                        )}
                                    </div>
                            ) : (
                            <div className="vacation-card-buttons">
                                <DeleteIcon
                                    style={{ marginRight: '10px', cursor: 'pointer', color: 'red' }}
                                    onClick={handleDeleteVacation}
                                />
                                <EditIcon
                                    style={{ cursor: 'pointer', color: 'orange' }}
                                    onClick={handleEditVacation}
                                />
                            </div>
                                )}
                            {error && <div style={{ color: 'red' }}>{error}</div>}
                        </div>
                    </Card.Body>
                </Card>
            </Col>
        </Row>
        </div >
    );
};

export default VacationCard;
