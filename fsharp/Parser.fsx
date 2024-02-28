#!/usr/bin/env dotnet fsi --langversion:preview

#r "nuget: FParsec"

open FParsec

type Command = {
  name: string
  operator: string
  operand1: int
  operand2: int
}

type Program = {
  commands: Command list
}

let operatorParser = pchar '+' <|> pchar '-' <|> pchar '*' <|> pchar '/'

let operandParser = many1Chars digit |>> int

let commandNameParser = many1Chars letter

let commandParser = 
    commandNameParser >>= fun name -> 
        between (spaces >>. pstring "{" >>. spaces) (spaces .>> pstring "}") 
            ((operandParser .>> spaces .>>. operatorParser .>> spaces .>>. operandParser) 
            |>> (fun ((x, op), y) -> { name = name; operator = string op; operand1 = x; operand2 = y }))

let programParser = spaces >>. many (spaces >>. commandParser .>> spaces)
                    |>> (fun cmds -> { commands = cmds })

let program = run programParser "   test    {   123   +  456   }   

bleep{   789   -  321}

bloop{14*2}

"

let executeProgram = function
    | { commands = cmds } -> 
        cmds |> List.iter (fun cmd -> 
            match cmd.operator with
            | "+" -> printfn "%s" (cmd.name + ": " + string (cmd.operand1 + cmd.operand2))
            | "-" -> printfn "%s" (cmd.name + ": " + string (cmd.operand1 - cmd.operand2))
            | "*" -> printfn "%s" (cmd.name + ": " + string (cmd.operand1 * cmd.operand2))
            | "/" -> printfn "%s" (cmd.name + ": " + string (cmd.operand1 / cmd.operand2))
            | _ -> printfn "Invalid operator"
        )
        
match program with
| Success (result, _, _) -> executeProgram result
| Failure (msg, _, _) -> printfn "Error: %s" msg