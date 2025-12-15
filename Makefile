ALL: Transcendance

Transcendance:
	# mkdir -p ~/data
	# mkdir -p ~/data/mariadb
	# mkdir -p ~/data/wordpress
	sudo docker build -t base:bullseye srcs/requirements/base
	sudo docker-compose -f srcs/docker-compose.yml -p Transcendance up --build


clean:
	sudo docker-compose -f srcs/docker-compose.yml -p Transcendance down -v
	sudo docker images -q | xargs -r sudo docker rmi -f

	#sudo docker image rmi -f $(docker images -q)

fclean:	clean
	sudo rm -rf ~/data
	
re: fclean Transcendance



.PHONY: all clean re