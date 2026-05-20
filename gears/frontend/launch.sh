#!/bin/sh

npm i /data
# npm update

# echo "URL:" $URL

if [ "$APP_MODE" = "dev" ]; then
	echo "DEV";
	exec npm run dev /data -- --host 0.0.0.0;
elif [ "$APP_MODE" = "prod" ]; then
	echo "START";
	# if [ -d "app/frontend/dist" ]; then
	# 	rm -rf "app/frontend/dist";
	# fi
	exec npm start /data;
fi

# "npm", "i", "&&", "npm", "run", "dev", "--", "--host", "0.0.0.0"