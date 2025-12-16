
MSG="default msg"


ALL: transcendance

transcendance:
	# mkdir -p ~/data
	# mkdir -p ~/data/mariadb
	# mkdir -p ~/data/wordpress
# 	docker build -t base:bullseye gears/base
	docker-compose -f docker-compose.yml -p transcendance up --build


clean:
	docker-compose -f docker-compose.yml -p transcendance down -v
	docker images -q | xargs -r docker rmi -f

	#docker image rmi -f $(docker images -q)

fclean:	clean
	rm -rf ~/data
	
re: fclean transcendance

add:
	git add app/ gears/ docker-compose.yml Makefile README.md
	git commit -m $(MSG)
	git status

.PHONY: all clean re add