/* collection of game related helper functions */
var $db = require('./mongo');
var debug = require('debug')('wol:leaderboard');
var gameres = require('./gameres');
var $q = require('q');

exports.process = function(game, dmp) {
    var defer = $q.defer();
    var match = gameres(dmp);
    debug('WOL Gameres packet recieved');
    debug('game: %s, idno: %d, player: %s', game, match.idno, match.players[match.client.spid].nam);

    defer.resolve(match);

    // create raw dump entry
    // TODO: check against spid (sender id) to ensure only 1 packet from each player
    var $dumps = $db.get(game +'_dumps');
    $dumps.update(
        {idno: match.idno},
        {$push: {buffers: match.buffer.toString('utf8')}},
        {upsert: true}
    );

    // todo: make this more efficent; no need to update then find
    // should be able to use the same search query
    $dumps.find({idno: match.idno}, function(err, doc) {
        if (doc.length > 1) {
            // error scneario, we have two entries for the same game
            // todo: figure out what the hell to do?
            // todo: elimiate duplicates?
            return;
        }

        // only continue if this is the first entry for a game
        if (doc[0].buffers.length > 1) return;

        // create player entry
        var $players = $db.get(game +'_players');
        match.players.forEach(function(player) {
            var stats = {
                $push: {games: match.idno},
                $inc: {points: 2}
            };

            /* evaluate wolv2 completions */
            // 256 is won, 512 is defated
            // 528 is lost connection or kicked
            if (player.cmp) {
                stats.$inc[(player.cmp == 256 ? 'wins' : 'losses')] = 1;
                if (player.cmp == 528) stats.$inc.disconnects = 1;
                if (player.cmp == 256) stats.$inc.points += 10;
            }

            $players.update({name: player.nam}, stats, {upsert: true});
        });

        // create game entry if WOLv2
        if (match.client.vers.toLowerCase() === 'v2.0') {
            // mongo.insert(game +'_'+ 'games', dmp);
            // locate ts_games document with matching idno then insert or update
        }
    });

    return defer.promise;
};
