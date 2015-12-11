var debug = require('debug')('wol:leaderboard');
var $db = require(global.cwd + '/lib/mongo');
var _sanitize = require(global.cwd + '/lib/player/lib/sanitize');
var $q = require('q');

module.exports = function create(game, clan, player) {
    var deferred = $q.defer();

    var $clans = $db.get(game +'_clans');
    var $players = $db.get(game +'_players');

    // check if player is in clan
    $players.findOne({name: _sanitize(player, true)}, function(err, player_data) {
        if (player_data.clan) return deferred.reject(); // player already in clan

        // check if clan already exists
        $clans.findOne({name: _sanitize(clan, true)}, function(err, clan_data) {
            if (clan_data) return deferred.reject(); // clan already exists

            // create clan and add player to it
            var record = {
                name: _sanitize(clan, null, true),
                nam: clan,
                created: Math.floor(Date.now() / 1000),
                points: global.DEFAULT_POINTS,
                games: [],
                founder: player,
                members: [
                    player
                ]
            };

            $clans.insert(record).success(function() {
                /* add clan to player record */
                $players.update({name: _sanitize(player, true)}, {
                    $set: {
                        clan: _sanitize(clan, null, true)
                    }
                });

                deferred.resolve();
            });
        });
    });

    return deferred.promise;
};