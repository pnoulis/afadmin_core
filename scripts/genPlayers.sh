#!/usr/bin/env bash

declare -i i=0
PLAYERSFILE=./players.js
cat <<EOF > ${PLAYERSFILE}
const BACKEND_PLAYERS = [
EOF

while (( i < 100 )); do
  i=$((++i))
  player=$(gname)
  name="${player%_*}${i}"
  surname="${player#*_}${i}"
  randomMerged=$((0 + $RANDOM % 2))
  if (( $randomMerged == 0 )); then
    # created a merged wristband player
    wristbandMerged=true
    wristbandNumber=$i
    wristbandColor=$((0 + $RANDOM % 7))

    randomActive=$((0 + $RANDOM % 2))
    if (( $randomActive == 0)); then
      # player is playing right now
      active=true
    else
      # player is not playing
      active=false
    fi

    cat <<EOF >> ${PLAYERSFILE}
{
username: "TG${i}",
name: "${name}",
surname: "${surname}",
email: "${name}.${surname}@maze.com",
wristbandMerged: ${wristbandMerged},
wristband: {
wristbandNumber: ${wristbandNumber},
wristbandColor: ${wristbandColor},
active: ${active}
}
},
EOF

  else
    wristbandMerged=false
    # create a not merged wristband player
    cat <<EOF >> ${PLAYERSFILE}
{
username: "TG${i}",
name: "${name}",
surname: "${surname}",
email: "${name}.${surname}@maze.com",
wristbandMerged: ${wristbandMerged},
wristband: null,
},
EOF

  fi

done


cat <<EOF >> ${PLAYERSFILE}
]
export { BACKEND_PLAYERS };
EOF
