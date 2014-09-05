#!/bin/sh
#######################################
#
# www.celtab.org.br
#
# Copyright (C) 2013
#                     Gustavo Valiati <gustavovaliati@gmail.com>
#                     Luis Valdes <luisvaldes88@gmail.com>
#                     Thiago R. M. Bitencourt <thiago.mbitencourt@gmail.com>
#
# This file is part of the FishBook project
#
# This program is free software; you can redistribute it and/or
# modify it under the terms of the GNU General Public License
# as published by the Free Software Foundation; version 2
# of the License.
#
# This program is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU General Public License for more details.
#
# You should have received a copy of the GNU General Public License
# along with this program; if not, write to the Free Software
# Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.
#
######################################



for i in $(seq 4)
do
    BASEMAC="B8:27:EB:21:28:B"
    MACADDRESS=$BASEMAC$i
    tail -f netcat_stream.txt | netcat localhost 8124 &

    sleep 1
    echo /dev/null > netcat_stream.txt
    sleep 1
    echo '00000133{"type":"SYN", "data":{"id":1200, "name":"NetCat", "macaddress":"'$MACADDRESS'"}, "datetime":"2014-05-23T18:43:48.342Z"}' >> netcat_stream.txt

    for j in $(seq 1)
    do
	sleep 2
	echo '00000382{"type":"DATA", "data":{"datasummary": {"data": [{"applicationcode": 0,"datetime": "2014-05-23T08:35:07","id": 575,"idantena": 1,"idcollectorpoint": 654,"identificationcode": 44332211}],"idbegin": -1272490348,"idend": -1272492740,"md5diggest": "5f948ccd5fce9ce26c02157cd0fcf31e"},"id": 0,"macaddress": "'$MACADDRESS'","name": ""}, "datetime":"2014-05-20T18:43:48.342Z"}' >> netcat_stream.txt
	sleep 2
	echo '00000382{"type":"DATA", "data":{"datasummary": {"data": [{"applicationcode": 0,"datetime": "2014-05-23T08:35:07","id": 575,"idantena": 1,"idcollectorpoint": 654,"identificationcode": 44332222}],"idbegin": -1272490348,"idend": -1272492740,"md5diggest": "5f948ccd5fce9ce26c02157cd0fcf31e"},"id": 0,"macaddress": "'$MACADDRESS'","name": ""}, "datetime":"2014-05-21T18:43:48.342Z"}' >> netcat_stream.txt
	sleep 2
	echo '00000382{"type":"DATA", "data":{"datasummary": {"data": [{"applicationcode": 0,"datetime": "2014-05-23T08:35:07","id": 575,"idantena": 1,"idcollectorpoint": 654,"identificationcode": 44332233}],"idbegin": -1272490348,"idend": -1272492740,"md5diggest": "5f948ccd5fce9ce26c02157cd0fcf31e"},"id": 0,"macaddress": "'$MACADDRESS'","name": ""}, "datetime":"2014-05-22T18:43:48.342Z"}' >> netcat_stream.txt
	sleep 2
	echo '00000382{"type":"DATA", "data":{"datasummary": {"data": [{"applicationcode": 0,"datetime": "2014-05-23T08:35:07","id": 575,"idantena": 1,"idcollectorpoint": 654,"identificationcode": 44332244}],"idbegin": -1272490348,"idend": -1272492740,"md5diggest": "5f948ccd5fce9ce26c02157cd0fcf31e"},"id": 0,"macaddress": "'$MACADDRESS'","name": ""}, "datetime":"2014-05-23T18:43:48.342Z"}' >> netcat_stream.txt
    done
    killall netcat
    killall tail
done
