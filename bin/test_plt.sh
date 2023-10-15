#!/bin/zsh

source ~/.zshrc

plt "
one, date {
  plotplug 10px dashed red
}

three, date {
  bar 10px dotted #7df
}

two, date {
  plot 10px solid #d83
}

A, date { highlight 0 1 solid yellow }

two, date {
  plot 3px dotted green
}

[one, two, three], date { bar 10px [solid red, solid green, solid blue] }
[one, two, three], date { stackbar 10px [solid orange, dashed #fed, dotted #8d2] }

three, date { bleep blop blip green 10 }
" <test.csv | imgc