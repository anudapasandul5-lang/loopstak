#!/bin/sh
# flatten.sh in.png out.(png|webp) : put a transparent render on the #121212 page colour
s=$(ffprobe -v error -select_streams v:0 -show_entries stream=width,height -of csv=s=x:p=0 "$1")
ffmpeg -loglevel error -y -f lavfi -i color=c=0x121212:s=$s -i "$1" -filter_complex "[0][1]overlay=format=auto" -frames:v 1 -quality 86 "$2"
