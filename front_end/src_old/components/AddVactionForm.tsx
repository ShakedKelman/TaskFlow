import React, { useEffect, useState } from 'react';
import { VacationModel } from '../model/VacationModel';
import { addVacation } from '../api/vactions-api';
import { useNavigate } from 'react-router-dom';
import { Form, Button, Alert } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';


const AddVacationForm: React.FC = () => {
    const [newVacation, setNewVacation] = useState<VacationModel>(new VacationModel({}));
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const navigate = useNavigate();

    const { user } = useSelector((state: RootState) => state.auth);

    useEffect(() => {
        if (!user?.isAdmin) {
            navigate('/vacations');
        }
    }, [user, navigate]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setNewVacation(prev => ({ ...prev, [name]: value }));
    };

    const isDateInThePast = (date: string) => {
        return new Date(date) < new Date();
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        // Validate dates
        if (isDateInThePast(newVacation.startDate) || isDateInThePast(newVacation.endDate)) {
            setError("Start Date and End Date must be in the future.");
            return;
        }
        
        if (new Date(newVacation.startDate) > new Date(newVacation.endDate)) {
            setError("End Date must be after Start Date.");
            return;
        }

        try {
            await addVacation(newVacation);
            setSuccess("Vacation added successfully");
            console.log("Vacation added successfully:", newVacation);

            // Optionally, navigate to another page after successful submission
            navigate('/vacations'); // Navigate to the homepage or another route
        } catch (error) {
            setError("Failed to add vacation");
            console.error("Error adding vacation:", error);
        }
    };

    return (
        <div className="container">
            <h2 className="my-4">Add New Vacation (Admin Only)</h2>
            {error && <Alert variant="danger">{error}</Alert>}
            {success && <Alert variant="success">{success}</Alert>}
            <Form onSubmit={handleSubmit}>
                <Form.Group controlId="formDestination">
                    <Form.Label>Destination</Form.Label>
                    <Form.Control
                        type="text"
                        name="destination"
                        value={newVacation.destination}
                        onChange={handleInputChange}
                        required
                        placeholder="Enter destination"
                    />
                </Form.Group>

                <Form.Group controlId="formDescription">
                    <Form.Label>Description</Form.Label>
                    <Form.Control
                        as="textarea"
                        name="description"
                        value={newVacation.description}
                        onChange={handleInputChange}
                        required
                        placeholder="Enter description"
                    />
                </Form.Group>

                <Form.Group controlId="formStartDate">
                    <Form.Label>Start Date</Form.Label>
                    <Form.Control
                        type="date"
                        name="startDate"
                        value={newVacation.startDate}
                        onChange={handleInputChange}
                        required
                    />
                </Form.Group>

                <Form.Group controlId="formEndDate">
                    <Form.Label>End Date</Form.Label>
                    <Form.Control
                        type="date"
                        name="endDate"
                        value={newVacation.endDate}
                        onChange={handleInputChange}
                        required
                    />
                </Form.Group>

                <Form.Group controlId="formPrice">
                    <Form.Label>Price</Form.Label>
                    <Form.Control
                        type="number"
                        name="price"
                        value={newVacation.price}
                        onChange={handleInputChange}
                        required
                        placeholder="Enter price"
                    />
                </Form.Group>

                <Form.Group controlId="formImageFileName">
                    <Form.Label>Image File Name</Form.Label>
                    <Form.Control
                        type="text"
                        name="imageFileName"
                        value={newVacation.imageFileName || ''}
                        onChange={handleInputChange}
                        placeholder="Enter image file name"
                    />
                </Form.Group>

                <Button variant="success" type="submit" className="mt-3">Add Vacation</Button>
            </Form>
        </div>
    );
};

export default AddVacationForm;
