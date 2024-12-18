import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import { VacationModel } from '../../model/VacationModel';
import { editVacation, getVacations } from '../../api/vactions/vactions-api';
import { updateVacation } from '../../store/slices/vacationslice';
import { Form, Button, Alert, Spinner, Image } from 'react-bootstrap';
import { siteConfig } from '../../utils/SiteConfig';
import { getImageForVacation } from '../../api/images/images-api';
import axios from 'axios';
import '../../css/editForm.css';




const EditVacationForm: React.FC = () => {
    const dispatch = useDispatch();
    const { token } = useSelector((state: RootState) => state.auth);
    const { id } = useParams<{ id: string }>();
    const [vacation, setVacation] = useState<VacationModel | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { user } = useSelector((state: RootState) => state.auth);
    const navigate = useNavigate();
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [selectedImage, setSelectedImage] = useState<File | null>(null);
    const [images, setImages] = useState<string[]>([]);



    useEffect(() => {
        if (!token) return; // Add early return if no token

        const fetchVacationDetails = async () => {
            if (id) {
                try {
                    const vacationData = await getVacations(Number(id), token);
                    if (vacationData.length > 0) {
                        setVacation(vacationData[0]);
                        const vacationImages = await getImageForVacation(Number(id));
                        setImages(vacationImages);
                    } else {
                        setError('Vacation not found');
                    }
                } catch (err) {
                    setError('Failed to fetch vacation details');
                } finally {
                    setIsLoading(false);
                }
            }
        };

        fetchVacationDetails();
    }, [id]);

    const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const formattedValue = e.target.value.replace(/[^0-9.]/g, '');
        setVacation(prev => prev ? { ...prev, price: parseFloat(formattedValue) || 0 } : prev);
    };
    

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();

        if (user?.token && vacation) {

            try {
                let newImageFileName = (selectedImage !== null) ? selectedImage.name : vacation.imageFileName;

                // If there's an old image and a new image was uploaded, delete the old image
                const oldImageFileName = vacation.imageFileName;

                // Update vacation details with the new image filename (if changed)
                const updatedVacation = { ...vacation, imageFileName: newImageFileName };

                // insert everything into a form data object
                const formData = new FormData();
                for (const [key, value] of Object.entries(updatedVacation)) {
                    if (value !== undefined) {
                        formData.append(key, value as string); // Type assertion to string or Blob
                    }
                }
                formData.append('image', selectedImage as File);

                // Inspecting FormData entries
                const entries = Array.from(formData.entries());

                await editVacation(Number(id), formData, user.token);
                newImageFileName = selectedImage?.name;

                // Dispatch the updated vacation to Redux store
                dispatch(updateVacation(updatedVacation));

                // Refresh images to ensure they are updated
                const vacationImages = await getImageForVacation(Number(id));
                setImages(vacationImages);

                setSuccessMessage('Vacation updated successfully!');
                navigate('/vacations');
            } catch (err) {
                console.error(err);
                // This ensures both Axios and non-Axios errors are handled.
                const errorMessage = axios.isAxiosError(err) && err.response
                    ? err.response.data.message || 'Failed to update vacation'
                    : err instanceof Error
                        ? err.message
                        : 'Failed to update vacation';

                setError(errorMessage);
            }
        }
    };

    const formatDate = (date: string | undefined) => {
        if (!date) return '';
        const d = new Date(date);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setSelectedImage(file);
        }
    };
    const handleCancel = () => {
        navigate('/vacations');
    };

    if (isLoading) return <Spinner animation="border" />;

    let thisVacationImg;
    if (selectedImage) {
        thisVacationImg = (
            <Image
                src={URL.createObjectURL(selectedImage)}
                alt="New vacation image"
                style={{ maxWidth: '200px', maxHeight: '200px' }}
            />
        );
    } else if (vacation?.imageFileName) {
        thisVacationImg = (
            <Image
                src={`${siteConfig.BASE_URL}images/${vacation.id}`}
                alt="Current vacation image"
                style={{ maxWidth: '200px', maxHeight: '200px' }}
            />
        );
    }

    return (
        <div className="edit-vacation-form">
        <h2 className="form-title">Edit Vacation</h2>
        <Form onSubmit={handleSubmit}>
            {error && <Alert variant="danger">{error}</Alert>}
            {successMessage && <Alert variant="success">{successMessage}</Alert>}

            <Form.Group controlId="destination">
                <Form.Label>Destination:</Form.Label>
                <Form.Control
                    type="text"
                    value={vacation?.destination || ''}
                    onChange={(e) => setVacation({ ...vacation!, destination: e.target.value })}
                />
            </Form.Group>
            <Form.Group controlId="description">
                <Form.Label>Description:</Form.Label>
                <Form.Control
                    as="textarea"
                    rows={3}
                    value={vacation?.description || ''}
                    onChange={(e) => setVacation({ ...vacation!, description: e.target.value })}
                />
            </Form.Group>
            <Form.Group controlId="startDate">
                <Form.Label>Start Date:</Form.Label>
                <Form.Control
                    type="date"
                    value={formatDate(vacation?.startDate)}
                    onChange={(e) => setVacation({ ...vacation!, startDate: e.target.value })}
                />
            </Form.Group>
            <Form.Group controlId="endDate">
                <Form.Label>End Date:</Form.Label>
                <Form.Control
                    type="date"
                    value={formatDate(vacation?.endDate)}
                    onChange={(e) => setVacation({ ...vacation!, endDate: e.target.value })}
                />
            </Form.Group>
            <Form.Group controlId="price">
                <Form.Label>Price:</Form.Label>
                <Form.Control
                    type="number"
                    value={vacation?.price || 0}
                    onChange={handlePriceChange}
                    min="0"
                    step="1"
                />
            </Form.Group>

            <Form.Group>
                <Form.Label>Current Image:</Form.Label>
                {thisVacationImg}
            </Form.Group>
            <Form.Group controlId="newImage">
                <Form.Label>New Image</Form.Label>
                <Form.Control
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                />
            </Form.Group>
            <Button variant="outline-primary" type="submit" style={{ margin: '10px' }}>
                Update Vacation
            </Button>
            <Button variant="outline-primary" onClick={handleCancel}>
                Cancel
            </Button>
        </Form>
    </div>
    );

};

export default EditVacationForm;
