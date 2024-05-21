module Unix

open System
open System.Diagnostics
open System.IO
open System.Threading.Tasks

type CommandResult =
  { ExitCode: int
    StandardOutput: string
    StandardError: string }

let base64ToHtmlImg (base64Img) =
    $"<img src=\"data:image/png;base64,{base64Img}\" style=\"width: 500px\"/>"

let executeCommand executable args =
  async {
    let! ct = Async.CancellationToken

    let startInfo = ProcessStartInfo()
    startInfo.FileName <- executable
    startInfo.RedirectStandardOutput <- true
    startInfo.RedirectStandardError <- true
    startInfo.UseShellExecute <- false
    startInfo.CreateNoWindow <- true
    for a in args do
      startInfo.ArgumentList.Add(a)

    use p = new Process()
    p.StartInfo <- startInfo
    p.Start() |> ignore
    
    let outTask =
      Task.WhenAll([|
        p.StandardOutput.ReadToEndAsync(ct);
        p.StandardError.ReadToEndAsync(ct) |])

    do! p.WaitForExitAsync(ct) |> Async.AwaitTask
    let! out = outTask |> Async.AwaitTask

    return
      { ExitCode = p.ExitCode
        StandardOutput = out.[0]
        StandardError = out.[1] }
  }

let executeShellCommand command =
    executeCommand "/usr/bin/env" [ "-S"; "zsh"; "-c"; "source ~/.zshexec; " + command ]

let executeUnixCommand command input =
    let fullCommand = sprintf "echo \"%s\" | %s" input command
    executeShellCommand fullCommand |> Async.RunSynchronously

let zsh command input = 
  match input with
  | Ok i -> 
      let result = executeUnixCommand command i
      if result.ExitCode = 0 then Ok result.StandardOutput else Error result.StandardError
  | Error e -> Error e

let echo = function
  | Ok i -> printfn "%s" i
  | Error e -> printfn "%s" e

let commandFunc commandName pattern (input : Result<string, string>) =
  match input with
  | Ok i -> 
      let fullCommand = commandName + " " + pattern
      let result = executeUnixCommand fullCommand i
      if result.ExitCode = 0 then Ok result.StandardOutput else Error result.StandardError
  | Error e -> Error e

let grep = commandFunc "grep"
let awk = commandFunc "gawk"

let plt64 pltProgram =
    zsh $"plt '{pltProgram}' | tee >(imgc > /dev/null) | base64"

let ggplot64 ggplotProgram =
    zsh $"ggplot '{ggplotProgram}' | tee >(imgc > /dev/null) | base64"