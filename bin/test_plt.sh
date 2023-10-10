#!/bin/zsh

plt "
one, date {
  plotplug 10px dashed red
}

A, date { highlight 0 1 solid yellow }

two, date {
  plot 3px dotted green
}

[one, two, three], date  bar 10px [solid red, solid green, solid blue] }
[one, two, three], date { stackbar 10px [solid orange, dashed #fed, dotted #8d2] }

three, date { bleep blop blip green 10 }
" <test.csv | imgcat