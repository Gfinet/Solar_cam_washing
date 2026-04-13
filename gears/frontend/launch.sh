#!/bin/sh

npm i 
# npm update

# echo "URL:" $URL

if [ "$APP_MODE" = "dev" ]; then
	echo "DEV";
	exec npm run dev -- --host 0.0.0.0;
elif [ "$APP_MODE" = "prod" ]; then
	echo "START";
	# if [ -d "app/frontend/dist" ]; then
	# 	rm -rf "app/frontend/dist";
	# fi
	exec npm start;
fi

# "npm", "i", "&&", "npm", "run", "dev", "--", "--host", "0.0.0.0"