#!/bin/sh
echo 'STARTING: PHAN MEM 4T'
IP="$(ip -o route get to 8.8.8.8 | sed -n 's/.*src \([0-9.]\+\).*/\1/p')"
sed -i "s/.*PUBLIC_DB_ADDRESS.*/PUBLIC_DB_ADDRESS=${IP}/g" .env
echo 'IP ADDRESS HAS BEEN SET UP'
exec npm run dev -- --host &
cd pocketbase_linux &&
exec ./launchDB.sh & 
wait
