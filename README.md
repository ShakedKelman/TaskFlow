# project_3
how to create DB and initialize:
1. install mariaDB or mysql

2. login as root using: 
mysql -u root -p

3.make sure you have no password to root(id you do have a paswword-password is saved in .env)

4. do the following command to create the database:
CREATE DATABASE vacations;

5. open the back-end folder and go to initialDB file

6. to create the tables for vacations and insert data write in terminal :
ts-node ./src/db/initialDB.ts

7.in terminal activate the express app and server using:
npm start

8. in the front end folder write in terminal to activate react app:
npm start


9. to run tests in back end write in terminal:
npm test

10.if you would like to use the pre-made images go to the vacation-images file in the git repository and add the images.
