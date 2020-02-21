@echo off
msiexec /Option /package
start 
C:\install_skript\node-v12.14.1-x64.msi /passive
C:\install_skript\Git-2.25.0-64-bit.exe /passive /wait
C:\install_skript\mysql-installer-community-8.0.11.0.msi /passive
cd C:\install_skript
git clone --single-branch --branch test https://github.com/Lexa307/cardgame
cd C:\install_skript\cardgame
npm install
exit