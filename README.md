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

* `:game` can be any of the following `(td|d2k|ra1|ts|fs|ra2|yr)`
* `:gameId` can only be numeric `(0-9)`
* `:player` can be alpha-numeric with some special characers `(\w\d\[\])`

**Endpoints**

* GET `/ping` to test that the ladder is online
* GET `/ladder/:game` will return the top 250 ladder results for the supplied `:game`
* GET `/ladder/:game/game/:gameId` will return all data for a given `:gameId`
* GET `/ladder/:game/player/:player` will return all data for a given `:player` 
* POST `/ladder/:game` accepts gameres packet (from POST body) for the supplied `:game`