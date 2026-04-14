#!/bin/sh

rm -f package-lock.json
###DELETE

npm i 
# npm update

sleep 5
npx prisma generate
npx prisma db push

# echo "URL:" $URL

if [ "$APP_MODE" = "dev" ]; then
	echo "DEV";
	exec npm run dev;
elif [ "$APP_MODE" = "prod" ]; then
	echo "START";
	# if [ -d "app/frontend/dist" ]; then
	# 	rm -rf "app/frontend/dist";
	# fi
	exec npm start;
fi