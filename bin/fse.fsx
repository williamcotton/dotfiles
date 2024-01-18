#!/usr/bin/env dotnet fsi

#nowarn "211"
#I "/Users/williamc/dotfiles/fsharp"
#nowarn "211"
#I "/Users/williamcotton/dotfiles/fsharp" 
#nowarn "211"
#I "/Users/administrator/dotfiles/fsharp" 
#load "Utils.fsx" 

open Unix
open DatabaseUtils
open WebUtils

Ok "pattern
    runner
    batter"
    |> grep "tt"
    |> awk """'{print $1 " " $1 " " $1}'"""
    |> echo

Ok "one,two,three,date
    1,2,3,2021-01
    4,5,6,2021-02
    7,8,2,2021-03"
    |> zsh "
        plt '[one, two, three], date { bar 10px [solid red, solid green, solid blue] }' |
        imgcat"
    |> echo
    
Ok "Host=localhost;Database=test"
    |> connectToDatabase
    |> executeQuery "SELECT title FROM documents LIMIT 10"
    |> readResults
    |> convertToJson
    |> echo

express
    |> get "/hello" (fun _ -> 
        Ok "Host=localhost;Database=test"
            |> connectToDatabase
            |> executeQuery "SELECT title FROM documents LIMIT 10"
            |> readResults
            |> convertToJson
            |> function
                | Ok json -> json
                | Error e -> e
    )
    |> get "/grep" (fun _ ->
        Ok "pattern
        runner
        batter"
        |> grep "tt"
        |> awk """'{print $1 " " $1 " " $1}'"""
        |> function
            | Ok output -> output
            | Error e -> e
    )
    |> get "/hello/:name" (fun (req, _) -> sprintf "Hello, %s!" req.Url.Segments.[2])
    |> listen "http://localhost:8080/"