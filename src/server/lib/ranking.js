var $db = require('./mongo');
var $q = require('q');
var last_update = {};
last_update['ts'] = _timestamp() - 350;
last_update['ra'] = _timestamp() - 350;

exports.player = function(game, limit) {
    var defer = $q.defer();

    $db.get(game + '_ladder').find({}, {limit: limit, sort: {rank: 1}}, function(err, data) {
        // data.push({last_update: last_update[game]});
        // TODO: remove games array from each player in result
        defer.resolve(data);

        /* if cache theshold elapsed; generate new cache*/
        if (last_update[game] < _timestamp() - 300) _notch(game);
    });

    return defer.promise;
};

/* updates leaderboard cache */
function _notch(game) {
    $db.get(game + '_players').find({}, {limit: 1000, sort: {points: -1}}, function(err, data) {
        data.forEach(function(item, index) {
            item.rank = (index + 1);
        });
        $db.get(game + '_ladder').drop();
        $db.get(game + '_ladder').insert(data, function(err, doc) {
            last_update[game] = _timestamp();
        });
    });
}

function _timestamp() {
    return Math.floor(Date.now() / 1000);
}
