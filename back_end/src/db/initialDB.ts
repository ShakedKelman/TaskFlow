import { encryptPassword } from "../utils/authUtils";
import runQuery, { closeDB } from "./dal";
const fs = require('fs');
const path = require('path');


const createTables = async () => {
    //    Create the users table
    let Q = `
    CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
            firstName VARCHAR(50) NOT NULL,
            lastName VARCHAR(50) NOT NULL,
            email VARCHAR(100) NOT NULL UNIQUE,
            hashedPassword VARCHAR(255) NOT NULL,
            isAdmin TINYINT(1) NOT NULL DEFAULT 0,
            token VARCHAR(1024) DEFAULT NULL,
            CONSTRAINT unique_fname_lname UNIQUE (firstName, lastName)


        );
     `;
    await runQuery(Q);

   ///Create the vacations table
     Q = `
    CREATE TABLE IF NOT EXISTS vacations (
        id INT AUTO_INCREMENT PRIMARY KEY,
            destination VARCHAR(100) NOT NULL,
            description VARCHAR(255) NOT NULL,
            startDate DATE NOT NULL,
            endDate DATE NOT NULL,
            price DECIMAL(10, 2) NOT NULL,
            imageFileName VARCHAR(255) NULL,
        image_path VARCHAR(255) NULL,
        CONSTRAINT image_path_uuid UNIQUE (image_path)


        );
    `;
    await runQuery(Q);


    // // Create the followers table
     Q = `
    CREATE TABLE IF NOT EXISTS followers (
        userId INT NOT NULL,
            vacationId INT NOT NULL,
            FOREIGN KEY (userId) REFERENCES users(id),
            FOREIGN KEY (vacationId) REFERENCES vacations(id),
            PRIMARY KEY (userId, vacationId)
        );
    `;
    await runQuery(Q);
    // create the count table for counting the number of api calls 
    Q = `
    CREATE TABLE IF NOT EXISTS counts (
        apicall INT NOT NULL DEFAULT 0,
        CONSTRAINT noZeroTwice UNIQUE (apicall)

        );
    `;
    await runQuery(Q);
};





const insertData = async () => {


    const hashedPassword1 = await encryptPassword('1234');
    const hashedPassword2 = await encryptPassword('1234');
    const hashedPassword3 = await encryptPassword('1234'); // For Admin
    const hashedPassword4 = await encryptPassword('1234'); // For NotAdmin

    // Insert sample data into users with hashed passwords
    let Q = `
        INSERT IGNORE INTO users (firstName, lastName, email, hashedPassword, isAdmin, token)
        VALUES 
            ('John', 'Doe', 'john.doe@example.com', ?, 0, NULL),
            ('Jane', 'Smith', 'jane.smith@example.com', ?, 1, NULL),
            ('Admin', 'User', 'admin@gmail.com', ?, 1, NULL),
            ('NotAdmin', 'User', 'notadmin@gmail.com', ?, 0, NULL);
        `;
    await runQuery(Q, [hashedPassword1, hashedPassword2, hashedPassword3, hashedPassword4]);



    // //     // ///Insert sample data into vacations
     Q = `
        INSERT IGNORE INTO vacations (destination, description, startDate, endDate, price, imageFileName,image_path)
        VALUES 
            ('Africa', 'Explore the wildlife of Africa', '2024-11-10', '2024-11-20', 2300.00, 'Africa.webp', 'e3e9f67f-4c3c-4362-b991-aaccbb32ce26.webp' ),
            ('Alaska', 'Experience the wilderness of Alaska', '2024-12-01', '2024-12-10', 2000.00, 'Alaska.avif', 'c415bd4e-a479-409c-b7b7-0f83cc047ef3.avif' ),
            ('Bahamas', 'Enjoy the tropical beauty of the Bahamas', '2024-11-15', '2024-11-22', 1800.00, 'Bahamas.jpeg', '8617119c-2b2b-41cc-bf64-f972b724dac8.jpeg' ),
            ('Bora Bora', 'A luxurious escape to Bora Bora', '2024-10-01', '2024-10-10', 2500.00, 'Bora-Bora.webp', '5d57dc1b-8ca4-4457-872c-abc5c7af9801.webp' ),
            ('Greece', 'Enjoy the history and islands of Greece', '2024-12-10', '2024-12-20', 1800.00, 'Greece.jpeg', 'b35858fc-7548-4657-942e-770f1364599a.jpeg' ),
            ('Hawaii', 'Experience paradise in Hawaii', '2024-10-05', '2024-10-12', 2400.00, 'Hawaii.avif', '0332faec-327a-4f9c-a58d-4dfdb15d77f2.avif' ),
            ('Iceland', 'Explore the stunning landscapes of Iceland', '2024-11-05', '2024-11-12', 2200.00, 'Iceland.jpeg', 'fad0791d-3fdc-4ba9-aa45-64ff40de9fc1.jpeg' ),
            ('Japan', 'Discover the culture and sights of Japan', '2024-10-20', '2024-10-30', 2100.00, 'Japan.avif', '0d8d7aad-178a-4423-8bf1-d292f76a3940.avif' ),
            ('Mexico', 'Relax in the beaches of Mexico', '2024-10-15', '2024-10-25', 1700.00, 'Mexico.jpeg', 'e6e83087-ae6f-4721-abe1-e1a3966d19b1.jpg' ),
            ('Paris', 'A romantic getaway to Paris', '2024-12-05', '2024-12-12', 1900.00, 'Paris.avif', '5b1535a4-221f-4787-924c-9fd0b654f3d9.avif' ),
            ('Rome', 'Discover the ancient history of Rome', '2024-12-15', '2024-12-22', 2000.00, 'Rome.jpg', '40f6f5b0-7383-410c-8ea9-3fa9aa2a78eb.jpg' ),
            ('Seychelles', 'Relax in the beautiful Seychelles islands', '2024-11-20', '2024-11-30', 2500.00, 'Seychelles.jpeg', 'b91bbae3-be0c-4f85-9f3b-9a847f8fbf30.jpeg');
    
    `;
    await runQuery(Q);


//    copy randomUUID.jpg to ../assets/images

    // Insert sample data into followers

        Q = `
    INSERT IGNORE INTO followers (userId, vacationId)
    VALUES 
        (1, 1),
        (1, 2),
        (2, 1);
    `;

    await runQuery(Q);

    // Insert number 0 count into counts

    Q = `
    INSERT IGNORE INTO counts (apicall)
    VALUES 
        (-1)
        
    `;

    await runQuery(Q);

}


const copyImages = async () => {
    const sourceDir = path.join(__dirname, 'images');
    const targetDir = path.join(__dirname, '..','assets/images'); // Change to your desired target directory

  // Delete existing files and subdirectories in the target directory
  const deleteFiles = (dir) => {
    fs.readdir(dir, (err, files) => {
        if (err) {
            console.error(`Error reading directory ${dir}:`, err);
            return;
        }
        for (const file of files) {
            const filePath = path.join(dir, file);
            fs.stat(filePath, (err, stat) => {
                if (err) {
                    console.error(`Error getting file stats for ${filePath}:`, err);
                    return;
                }
                if (stat.isDirectory()) {
                    // If it's a directory, recursively delete its contents
                    deleteFiles(filePath);
                    fs.rmdir(filePath, (err) => {
                        if (err) {
                            console.error(`Error deleting directory ${filePath}:`, err);
                        } else {
                            console.log(`Deleted directory ${filePath}`);
                        }
                    });
                } else {
                    // If it's a file, delete it
                    fs.unlink(filePath, (err) => {
                        if (err) {
                            console.error(`Error deleting file ${filePath}:`, err);
                        } else {
                            console.log(`Deleted file ${filePath}`);
                        }
                    });
                }
            });
        }
        return 0   });
};

deleteFiles(targetDir);

    // Fetch the image paths
    const fetchImagePathsQuery = 'SELECT image_path FROM vacations';
    const imagePaths = await runQuery(fetchImagePathsQuery);

    for (const row of imagePaths) {
        const sourcePath = path.join(sourceDir, row.image_path);
        const targetPath = path.join(targetDir, row.image_path);

        // Ensure the target directory exists
        fs.mkdirSync(path.dirname(targetPath), { recursive: true });

        // Copy the file
        fs.copyFile(sourcePath, targetPath, (err) => {
            if (err) {
                console.error(`Error copying file ${sourcePath} to ${targetPath}:`, err);
            } else {
                console.log(`Copied ${sourcePath} to ${targetPath}`);
            }return 0
        });
    }
};

// insertData().then(() => {
//     console.log("Done insertData");
// });

const runSetup = async () => {
    await createTables();
    await insertData();
    await copyImages();
await closeDB();
    console.log("Done creating tables, inserting data, and copying images");
};

runSetup().catch(err => {
    console.error("Error during setup:", err);
});


