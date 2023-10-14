impbcopyoc:
	gcc -Wall -g -O3 -ObjC -framework Foundation -framework AppKit -o impbcopyoc impbcopy.m

impbcopy:
	swiftc impbcopy.swift -o impbcopy

impbpaste:
	swiftc impbpaste.swift -o impbpaste

filterpng:
	swiftc filterpng.swift -o filterpng

yip:
	lex yip.l
	cc lex.yy.c -o yip -ll