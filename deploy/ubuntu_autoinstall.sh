sudo apt install curl;​
curl -sL https://deb.nodesource.com/setup_10.x | sudo -E bash -;​
sudo apt install nodejs;​
sudo apt install mysql-server;​
sudo apt install python3.7;
mysql_secure_installation;​
sudo apt install git;
git clone --single-branch --branch test https://github.com/Lexa307/cardgame;
cd cardgame;​
npm install;​
cd DB;
mysql -u root –p**** <init.sql;​
cd -;​
node index.js;