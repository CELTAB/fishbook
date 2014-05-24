#!/bin/sh

for i in {1..4}
do
    BASEMAC="B8:27:EB:21:28:B"
    MACADDRESS=$BASEMAC$i
    tail -f netcat_stream.txt | netcat localhost 8124 &

    sleep 1
    echo /dev/null > netcat_stream.txt
    sleep 1
    echo '00000133{"type":"SYN", "data":{"id":1200, "name":"NetCat", "macaddress":"'$MACADDRESS'"}, "datetime":"2014-05-23T18:43:48.342Z"}' >> netcat_stream.txt

    for i in {1..2} 
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