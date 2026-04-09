
MSG="default msg"


ALL: transcendance

transcendance:
	APP_MODE="prod" docker-compose -f docker-compose.yml -p transcendence up --build


clean:
	docker-compose -f docker-compose.yml -p transcendance down -v
	docker images -q | xargs -r docker rmi -f

	#docker image rmi -f $(docker images -q)

dev:
	APP_MODE="dev" docker-compose -f docker-compose.yml -p transcendence up --build

fclean:	clean
	
re: fclean transcendance

add:
	git add gears/ docker-compose.yml Makefile README.md .gitignore
	git status
	git commit -m "$(MSG)"

.PHONY: all clean re add