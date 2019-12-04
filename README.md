# cardgame
the system is a five-tier architecture:
1)client(forms to reg/auth sends requests to web server, THREE.js client application connected to core-server)
2)web-server(using for uthtorization/registration and validation user data)
3)core - server (there we playing a game connected to this server via web sockets)
4)database server(connected web-server,core-server,moderation control system)
5)moderation control system (connected to db and core-server)
