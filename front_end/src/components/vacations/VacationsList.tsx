import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../../store/store';
import VacationCard from './VacationCard';
import { VacationModel } from '../../model/VacationModel';
import { Row, Col, Form } from 'react-bootstrap';
import { fetchPaginatedVacations } from '../../api/vactions/vacationsThunk';
import Pagination from '@mui/material/Pagination';
import Stack from '@mui/material/Stack';
import { getVacations } from '../../api/vactions/vactions-api';
import { getFollowersForVacation } from '../../api/followers/follower-api';
import { setAllVacations, updateMultipleVacations, setLoadingStatus, setSuccessStatus, setPaginatedVacations } from '../../store/slices/vacationslice';
import "../../css/vactionList.css";


const VacationList: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { vacations, paginatedVacations, status: vacationStatus } = useSelector((state: RootState) => state.vacation);
    const { user, token } = useSelector((state: RootState) => state.auth);
    const [filter, setFilter] = useState<string>('all');
    const [page, setPage] = useState<number>(1);
    const [totalPages, setTotalPages] = useState<number>(0);

    const isAdmin = user?.isAdmin;



    useEffect(() => {
        let isSubscribed = true;

        if (!token) return;

        const fetchData = async () => {
            dispatch(setLoadingStatus());
            try {

                // Fetch all vacations
                const allVacations = await getVacations(undefined, token);
                if (!isSubscribed) return; // Cancel if component unmounted

                // Fetch follower info for all vacations in a single batch
                const followerPromises = allVacations.map(vacation =>
                    vacation.id ? getFollowersForVacation(vacation.id, token) : Promise.resolve([])
                );
                const allFollowers = await Promise.all(followerPromises);
                if (!isSubscribed) return; // Cancel if component unmounted

                // Combine vacation data with follower info in a single update
                const vacationsWithFollowers = allVacations.map((vacation, index) => ({
                    ...vacation,
                    followerCount: allFollowers[index].length,
                    isFollowing: user?.id ? allFollowers[index].some(f => f.id === user.id) : false
                }));

                // Update store with complete vacation data
                dispatch(setAllVacations(vacationsWithFollowers));
           
              const initialPaginatedData = vacationsWithFollowers.slice(0, 10);
              dispatch(setPaginatedVacations(initialPaginatedData));

                dispatch(setSuccessStatus());
            } catch (error) {
                console.error('Error fetching vacations:', error);
            }
        };

        fetchData();
        return () => {
            isSubscribed = false;
        };
    }, [dispatch, token, user?.id]);


    // Update total pages and handle pagination when filter or vacations change
    useEffect(() => {
        const filteredVacations = isAdmin ? vacations : applyFilter(vacations, filter);
        const total = Math.ceil(filteredVacations.length / 10);
        setTotalPages(total);

        // If current page is beyond new total, reset to page 1
        if (page > total) {
            setPage(1);
        }

        // Create a new array before sorting and slicing
        const paginatedData = [...filteredVacations]
            .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
            .slice((page - 1) * 10, page * 10);

        dispatch(setPaginatedVacations(paginatedData));
    }, [filter, vacations, isAdmin, page]);



    const applyFilter = (vacations: VacationModel[], filter: string) => {
        const now = new Date();
        return vacations.filter((vacation: VacationModel) => {
            const startDate = new Date(vacation.startDate);
            const endDate = new Date(vacation.endDate);

            // Return all vacations if filter is 'all'
            if (filter === 'all') return true;

            // For other filters, check the specific conditions
            switch (filter) {
                case 'following':
                    return vacation.isFollowing === true;
                case 'notStarted':
                    return startDate > now;
                case 'happeningNow':
                    return startDate <= now && endDate >= now;
                default:
                    return true;
            }
        });
    };
    const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
        setPage(value);
        const filteredVacations = isAdmin ? vacations : applyFilter(vacations, filter);
        const start = (value - 1) * 10;
        const end = start + 10;
        const paginatedData = [...filteredVacations]
            .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
            .slice(start, end);
        dispatch(setPaginatedVacations(paginatedData));
    };
  

    const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFilter(e.target.value);
        setPage(1); // Reset to first page when filter changes
    };

    if (vacationStatus === 'loading') return <div>Loading...</div>;

   
    return (
        <div className="container">
            {!isAdmin && (
                <Form>
                    <Form.Check
                        type="radio"
                        label="All"
                        name="filter"
                        value="all"
                        checked={filter === 'all'}
                        onChange={handleFilterChange}
                        className="custom-radio"
                    />
                    <Form.Check
                        type="radio"
                        label="Following"
                        name="filter"
                        value="following"
                        checked={filter === 'following'}
                        onChange={handleFilterChange}
                        className="custom-radio"
                    />
                    <Form.Check
                        type="radio"
                        label="Not Started"
                        name="filter"
                        value="notStarted"
                        checked={filter === 'notStarted'}
                        onChange={handleFilterChange}
                        className="custom-radio"
                    />
                    <Form.Check
                        type="radio"
                        label="Happening Now"
                        name="filter"
                        value="happeningNow"
                        checked={filter === 'happeningNow'}
                        onChange={handleFilterChange}
                        className="custom-radio"
                    />
                </Form>
            )}


            <Row>
                {paginatedVacations.map((vacation: VacationModel) => (
                    <Col key={vacation.id || "placeholder"} md={4} className="mb-4">
                        <VacationCard vacation={vacation} />
                    </Col>
                ))}
            </Row>

            <Stack spacing={2} className="mt-4">
                <Pagination
                    count={totalPages}
                    page={page}
                    onChange={handlePageChange}
                />
            </Stack>
        </div>
    );
};

export default VacationList;
