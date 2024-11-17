#!/bin/sh
echo 'STARTING: PHAN MEM 4T'
sed -i "s/.*PUBLIC_DB_ADDRESS.*/PUBLIC_DB_ADDRESS=127.0.0.1/g" .env
exec npm run dev -- --port=4444 &
cd pocketbase_linux &&
exec ./launchDB.sh & 
wait
