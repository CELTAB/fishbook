/****************************************************************************
**
** www.celtab.org.br
**
** Copyright (C) 2013
**                     Gustavo Valiati <gustavovaliati@gmail.com>
**                     Luis Valdes <luisvaldes88@gmail.com>
**                     Thiago R. M. Bitencourt <thiago.mbitencourt@gmail.com>
**
** This file is part of the FishBook project
**
** This program is free software; you can redistribute it and/or
** modify it under the terms of the GNU General Public License
** as published by the Free Software Foundation; version 2
** of the License.
**
** This program is distributed in the hope that it will be useful,
** but WITHOUT ANY WARRANTY; without even the implied warranty of
** MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
** GNU General Public License for more details.
**
** You should have received a copy of the GNU General Public License
** along with this program; if not, write to the Free Software
** Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.
**
****************************************************************************/

module.exports = function(db){

	var CollectorPoint = db.collection('collectors');

	var insertCallback = function(err){
		if(err){
			return console.log(err);
		}
		return console.log('Insert successful.');
	};

	var insert = function(collector){
		var newCollector = {
            name: collector.name,
            macAddress: collector.macaddress,
            description: "New collector point"
		};
		CollectorPoint.insert(insertCallback);
		return newCollector;
	};

	var checkIfExist = function(macAddress, callback){
		CollectorPoint.findOne({macAddress: macAddress}, function(err, doc){
			callback(doc!=null);
		});
	}

	return {
		insert: insert,
		checkIfExist: checkIfExist,
		CollectorPoint: CollectorPoint
	}
}