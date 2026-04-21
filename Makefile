
MSG="default msg"


ALL: solar_cam

solar_cam:
	APP_MODE="dev" docker-compose -f docker-compose.yml -p solar_cam up --build 
# MODE="prod"


clean:
	docker-compose -f docker-compose.yml -p solar_cam down -v
	docker images -q | xargs -r docker rmi -f

	#docker image rmi -f $(docker images -q)

dev:
	APP_MODE="dev" docker-compose -f docker-compose.yml -p solar_cam up --build

fclean:	clean
	
re: fclean solar_cam

stop:
	APP_MODE="dev" docker-compose -f docker-compose.yml -p solar_cam up --down

add:
	git add gears/ TCP_serv/ docker-compose.yml Makefile README.md .gitignore
	git status
	git commit -m "$(MSG)"

.PHONY: all clean re add