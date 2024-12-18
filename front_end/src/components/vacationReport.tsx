import React, { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';  // Import Bar chart instead of Line chart
import { CSVLink } from 'react-csv';
import * as XLSX from 'xlsx';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';
import { selectVacations } from '../store/slices/followersSlice';
import { getFollowersForVacation } from '../api/followers/follower-api';

// Import Chart.js components and register them
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    Title,
    Tooltip,
    Legend,
    BarElement,
} from 'chart.js';
import { VacationModel } from '../model/VacationModel';
import { getVacations } from '../api/vactions/vactions-api';
import { Button } from 'react-bootstrap';

ChartJS.register(
    CategoryScale,
    LinearScale,
    Title,
    Tooltip,
    Legend,
    BarElement
);

const reportStyles = {
    container: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        width: '100%',
        padding: '20px',
        fontFamily: "'Poppins', sans-serif",
    },
    reportCard: {
        width: '800px',
        padding: '30px',
        borderRadius: '15px',
        boxShadow: '0 8px 32px rgba(31, 38, 135, 0.15)',
    },
    title: {
        color: '#2C3E50',
        textAlign: 'center' as const,
        marginBottom: '30px',
        fontSize: '2.5rem',
        textShadow: '2px 2px 4px rgba(0, 0, 0, 0.1)',
    },
    buttonContainer: {
        display: 'flex',
        justifyContent: 'center',
        gap: '15px',
        marginTop: '25px',
    }
};

const Report: React.FC = () => {
    const { token, user } = useSelector((state: RootState) => state.auth);
    const vacations = useSelector(selectVacations);
    const [data, setData] = useState<{ destination: string; followers: number }[]>([]);
    const [allVacations, setAllVacations] = useState<VacationModel[]>([]);

    const isAdmin = user?.isAdmin;

    useEffect(() => {
        if (!token) return; // Early return if no token

        const fetchData = async () => {
            try {
                const vacations = await getVacations(undefined, token);
                setAllVacations(vacations);

                const reportData = await Promise.all(vacations.map(async (vacation) => {
                    if (vacation.id === undefined) {
                        return {
                            destination: vacation.destination,
                            followers: 0,
                        };
                    }

                    const vacationFollowers = await getFollowersForVacation(vacation.id, token);
                    return {
                        destination: vacation.destination,
                        followers: vacationFollowers.length,
                    };
                }));
                setData(reportData);
            } catch (error) {
                console.error('Error fetching vacation followers:', error);
            }
        };

        fetchData();
    }, [vacations, token]); // Add token to dependencies
    
    const chartData = {
        labels: data.map(item => item.destination),
        datasets: [
            {
                label: 'Number of Followers',
                data: data.map(item => item.followers),
                backgroundColor: 'rgba(75,192,192,0.4)',
                borderColor: 'rgba(75,192,192,1)',
                borderWidth: 1,
                barThickness: 35, // Adjust this to control the thickness of the bars
            },
        ],
    };
    const chartOptions = {
        scales: {
            x: {
                type: 'category' as const, // Use 'as const' to ensure the type is correctly inferred
                ticks: {
                    autoSkip: false, // Ensures all labels are displayed
                    maxRotation: 90, // Rotates labels if they are too long
                    minRotation: 0, // Minimum rotation
                },
                grid: {
                    display: false, // Hide grid lines to emphasize the vertical bars
                },
            },
            y: {
                beginAtZero: true,
                grid: {
                    drawBorder: false,
                    display: true, // Ensure grid lines are visible
                },
            },
        },
        plugins: {
            legend: {
                display: true,
            },
        },
    };
    
    
    

    const handleExportExcel = () => {
        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Report');
        XLSX.writeFile(wb, 'vacation_report.xlsx');
    };

    return (
        <div style={reportStyles.container}>
            <div style={reportStyles.reportCard}>
                <h2 style={reportStyles.title}>✈️ Vacation Destinations Report 🌴</h2>
                <Bar data={chartData} options={chartOptions} />
                <div style={reportStyles.buttonContainer}>
                    <Button 
                        variant="primary" 
                        className="me-2" 
                        onClick={handleExportExcel}
                        style={{
                            backgroundColor: '#4CAF50',
                            borderColor: '#4CAF50',
                        }}
                    >
                        📊 Export to Excel
                    </Button>
                    <CSVLink 
                        data={data} 
                        filename="vacation_report.csv"
                        style={{ textDecoration: 'none' }}
                    >
                        <Button 
                            variant="success"
                            style={{
                                backgroundColor: '#2196F3',
                                borderColor: '#2196F3',
                            }}
                        >
                            📋 Export to CSV
                        </Button>
                    </CSVLink>
                </div>
            </div>
        </div>
        );
    };
    

export default Report;
