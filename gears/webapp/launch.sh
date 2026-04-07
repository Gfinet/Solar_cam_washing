#!/bin/sh

# if [ -f "package-lock.json" ]; then
# 	npm ci;
# else
	npm i ;
# fi

# echo "URL:" $URL

if [ "$APP_MODE" = "dev" ]; then
	echo "DEV";
	exec npm run dev;
elif [ "$APP_MODE" = "prod" ]; then
	echo "START";
	if [ -d "app/frontend/dist" ]; then
		rm -rf "app/frontend/dist";
	fi
	exec npm start;
fi