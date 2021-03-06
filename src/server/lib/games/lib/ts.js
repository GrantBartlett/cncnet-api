var debug = require('debug')('wol:leaderboard');

var official_maps = [
    'A River Runs Near It',
    'Casey\'s Canyon',
    'Cliffs of Insanity',
    'Crater',
    'Desolation Redux',
    'Dueling Islands',
    'Forest Fires',
    'Grand Canyon',
    'Grassy Knoll',
    'Hextreme!',
    'Ice Cliffs',
    'Limited Access',
    'Night of the Mutants',
    'No where to run',
    'Pentagram',
    'Pit Or Plateau',
    'Pockets',
    'Seismic',
    'Sinkholes',
    'Storms',
    'Stormy Valley',
    'Super Bridgehead Redux',
    'Tactical Opportunities',
    'Terraces',
    'The Ice Must Flow',
    'Tiberium Garden Redux',
    'Tread Lightly',
    'Tunnel Train-ing'
];

exports.official = function(settings) {
    settings.official = false;
    /* check if map is official */
    for (var i = 0, x = official_maps.length; i < x; i++) {
        if (settings.scen == official_maps[i]) {
            settings.official = true;
            break;
        }
    }

    return settings;
};
