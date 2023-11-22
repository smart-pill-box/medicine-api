FROM postgres:14.6
COPY database.sql /docker-entrypoint-initdb.d/01.sql
COPY keycloak_db.sh /docker-entrypoint-initdb.d/02.sh