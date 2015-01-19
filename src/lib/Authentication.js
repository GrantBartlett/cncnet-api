/***
*   Copyright 2014 Sean Wragg <seanwragg@gmail.com>
*
*   Licensed under the Apache License, Version 2.0 (the "License");
*   you may not use this file except in compliance with the License.
*   You may obtain a copy of the License at
*
*	   http://www.apache.org/licenses/LICENSE-2.0
*
*   Unless required by applicable law or agreed to in writing, software
*   distributed under the License is distributed on an "AS IS" BASIS,
*   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
*   See the License for the specific language governing permissions and
*   limitations under the License.
*/

var Database = require(__dirname +'/Database.js'),
	Player = require(__dirname +'/Player.js'),
	Q = require('q');

var Authentication = {
	/*** 
	 * username doesn't mean nick. players can auth using their credentials
	 * the ladder will track players via IP and add uid from wol_auth into wol_game_stats.uid
	 */
	identify: function(attempt) {
		var deferred = Q.defer();

		if (!attempt.username || !attempt.password) {
			deferred.resolve({
				status: 401,
				body: {
					message: 'Missing account credentials'
				}
			});

			return deferred.promise;
		}

		var query = Database.format(
			'SELECT uid FROM wol_auth WHERE username = ? and password = ?', [attempt.username, attempt.password]
		);

		Database.query(query, function(err, data) {
			if (data.length < 1) {
				deferred.resolve({
					status: 401,
					body: {
						message: 'Account credentials incorrect'
					}
				});
			} else {
				deferred.resolve({
					status: 200,
					body: {
						message: 'Successful login'
					}
				});
			}
		});

		return deferred.promise;
	},

	session: function() {

	},

	create: function(account) {
		var deferred = Q.defer();

		if (!account.username || !account.password || !account.email) {
			deferred.resolve({
				status: 400,
				body: {
					message: 'Missing account information'
				}
			});

			return deferred.promise;
		}

		var query = Database.format(
			'SELECT uid, password FROM wol_auth WHERE username = ? OR email = ?', [account.username, account.email]
		);

		Database.query(query, function(err, results) {
			if (results.length > 0) {
				account.uid = results[0].uid;
				if (results[0].password != account.password) {
					deferred.resolve({
						status: 401,
						body: {
							message: 'Account credentials incorrect'
						}
					});
				} else {
					if (account.name && account.lid) {
						_player(deferred, account);
					} else {
						deferred.resolve({
							status: 200,
							body: {
								message: 'Account already exists',
								uid: account.uid
							}
						});
					}
				}
			} else {
				var auth = {
					username: account.username,
					password: account.password,
					email: account.email
				};

				Database.insert('wol_auth', auth, function(uid) {
					account.uid = uid;
					if (account.name && account.lid) {
						_player(deferred, account);
					} else {
						deferred.resolve({
							status: 201,
							body: {
								message: 'Account successfully created',
								uid: account.uid
							}
						});
					}
				});
			}
		});

		/* create_player */
		function _player(deferred, account) {
			Player.locate(account).then(function(player) {
				if (player.uid != account.uid) {
					deferred.resolve({
						status: 400,
						body: {
							message: 'Player already exists and bound to another account'
						}
					});
				} else if (player.exists) {
					deferred.resolve({
						status: 400,
						body: {
							message: 'Player already exists'
						}
					});
				} else {
					deferred.resolve({
						status: 201,
						location: ['/ladder', account.game, 'player', account.name].join('/'),
						body: {
							message: 'Player created (account bound)'
						}
					});
				}

				deferred.resolve(player);
			});
		}

		return deferred.promise;
	}
};

module.exports = Authentication;