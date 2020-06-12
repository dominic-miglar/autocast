#!/bin/sh

service dbus start
service avahi-daemon start

until avahi-browse --all --ignore-local --resolve --terminate
do
    echo "Waiting for avahi service to be up and running..."
    sleep 1
done

npm start

