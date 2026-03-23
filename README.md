# Gym2plitter_backend

Backend aplikacije Gym2plitter, izrađena s Node.js, Express i MongoDB.

## Lokalno postavljanje

```bash
git clone https://github.com/LukaRitosa/Gym2plitter_backend
```

## Napomena 1
Za neredbe je potrebno ići u direktorij:
```sh
cd app
```

## Instalacija dependecies

```sh
npm install
```

## Napomena 2

Potrebno je postaviti MongoDB bazu podataka, generirati hash za jwt secret, stvoriti .env i popuniti podatke:

```sh
MONGO_USERNAME=
PASSWORD=
MONGO_DB_NAME=
JWT_SECRET=
```

## Napomena 3

Pod corsOptions u index.js potrebno je postaviti options na frontendov URL npr:

```sh
'http://localhost:5173/'
```


## Napomena 4

Port u index.js za lokalan rad apikacije potrebno je postaviti na npr. 3000.


## Pokretanje servera

```sh
node index.js
```