
MSG="default msg"


ALL: transcendance

transcendance:
	docker-compose -f docker-compose.yml -p transcendance up --build


clean:
	docker-compose -f docker-compose.yml -p transcendance down -v
	docker images -q | xargs -r docker rmi -f

	#docker image rmi -f $(docker images -q)

fclean:	clean
	rm -rf ~/data
	
re: fclean transcendance

add:
	git add gears/ docker-compose.yml Makefile README.md
	git status
	git commit -m "$(MSG)"

.PHONY: all clean re add