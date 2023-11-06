#!/usr/bin/env dotnet fsi --langversion:preview
#nowarn "57"

type PltCommand =
    | Multi of string list * string * PltAction
    | Single of string * string * PltAction
and PltAction =
    | Plot of int * string * string
    | Highlight of string


let parseCommand (s: string): PltCommand =
    let parts = s.Split(' ')
    match parts with
    | [| ys; x; "{"; action; width; style; color; "}" |] ->
        let yFields = ys.Split(',', System.StringSplitOptions.RemoveEmptyEntries)
        let width = int width.[..^2]  // remove "px" and convert to int
        if yFields.Length > 1 then
            Multi (List.ofArray yFields, x, Plot (width, style, color))
        else
            Single (ys, x, Plot (width, style, color))
    | _ -> failwith "Invalid command"

let printCommand (cmd: PltCommand) =
    match cmd with
    | Multi (ys, x, action) ->
        printfn "Multi command with Y fields: %A, X field: %s, Action: %A" ys x action
    | Single (y, x, action) ->
        printfn "Single command with Y field: %s, X field: %s, Action: %A" y x action

let cmd = parseCommand "a, b { plot 2px solid red }"
printCommand cmd