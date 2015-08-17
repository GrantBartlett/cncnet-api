var $db = require('./mongo');
var $q = require('q');
global.cache = {};
var last_update = {
    ts: _timestamp() - 350,
    ra: _timestamp() - 350,
    fs: _timestamp() - 350,
    am: _timestamp() - 350
};

exports.player = function(game, limit) {
    var defer = $q.defer();

    defer.resolve(cache[game] || []);

    /* if cache theshold elapsed; generate new cache*/
    if (last_update[game] < _timestamp() - 300) {
        _notch(game);
    }

    return defer.promise;
};

/* updates leaderboard cache */
function _notch(game) {
    $db.get(game + '_players').find({}, {limit: 500, sort: {points: -1}}, function(err, data) {
        if (!data || data.length < 1) return;

        data.forEach(function(item, index) {
            item.rank = (index + 1);
            delete item.games;
        });

        cache[game] = data;
        last_update[game] = _timestamp();
    });
}

function _timestamp() {
    return Math.floor(Date.now() / 1000);
}
