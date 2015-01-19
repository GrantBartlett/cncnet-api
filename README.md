## Westwood Online (WOL) Ladder
This is an open source WOL Game Resolution emulator for legacy Command and Conquer games. Ideally, this app should work with any system sending WOLv1 or WOLv2 gameres packets - including Game Resolution UDP requests sent by the game clients. This app has several REST API endpoints to consume and post ladder data which are documented below.

### Games Supported
* Yuri's Revenge
* Red Alert 2
* Firestorm
* Tiberian Sun
* Red Alert 1
* Dune 2k
* Tiberian Dawn

### Usage
1. `npm install`
2. Install `_install/wol.sql`
3. Configure `src/config.js`
4. `npm start`

### API Endpoints
There's a few params listed below.

* `:game` can be any of the following `(td|d2k|ra|ts|fs|ra2|yr)`
* `:gameId` can only be numeric `(0-9)`
* `:player` can be alpha-numeric with some special characers `(\w\d\[\])`

##### General Endpoints
* GET `/ping` to ensure that the ladder is online

##### Game Endpoints
* GET `/ladder/:game` will return the top 250 ladder results for the supplied `:game`
* POST `/ladder/:game` accepts gameres packet (via POST body) for the supplied `:game`
* GET `/ladder/:game/games` will return the latest 250 games played for the given `:game`
* GET `/ladder/:game/games/:gameId` will return all data for a given `:gameId`

##### Player Endpoints
* PUT `/ladder/:game/player/:player` will create the given `:player`
* GET `/ladder/:game/player/:player` will return most data for given `:player` 
* DELETE `/ladder/:game/player/:player` will irrevocably delete the given `:player`
* GET `/ladder/:game/player/:player/auth` HTTP authentication using player creation credentials
* GET `/ladder/:game/player/:player/reset` request to reset account password

#### Player Creation
Player creation is optional as the ladder will accept results from players that are not authenticated. And although the database _will_ flag authenticated players, users can still impersonate one another (by playing as someone else). However, since the games are auth distingushed, it will be up to the API consumer to determine whether to display any games featuring unauthenticated players. 

Players can be created using the PUT `/ladder/:game/player/:player` endpoint. This endpoint expects a `form-data` request containing at least `username`, `password` and `email` (_not_ URL encoded) fields to establish an account. Other fields to help uniquely identify accounts will eventually be added but, are currently ignored.

_**example player creation request**_
```shell
curl -X PUT -H "Content-Type: multipart/form-data" -F "username=Tahj" -F "password=MySecretPassword" -F "email=tahj.kirk@gmail.com" http://localhost:4003/ladder/ts/player/tahj3z
```

If this is the first player registration for the user, the account will be stored using the credentials provided. If the account has been previously registered, the new `:player` will be associated with the account as long as the credentials provided are correct.

After a player has been created, they can then proceed to login using the GET `/ladder/:game/player/:player/auth` endpoint. This is accomplished over [basic HTTP authentication](http://en.wikipedia.org/wiki/Basic_access_authentication). An example login request would look similar to the following

_**example player auth request**_
```shell
$ curl -isu Tahj:MySecretPassword http://localhost:4007/ladder/ts/player/tahj3z/auth
```