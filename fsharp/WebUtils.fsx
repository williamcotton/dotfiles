open System.IO
open System.Net
open System.Net.Mime
open System.Text.RegularExpressions
open System.Threading.Tasks

type RequestHandler = HttpListenerRequest * HttpListenerResponse -> string

type Route = Regex * RequestHandler

type ExpressApp = { 
    Routes: Route list 
}

let express = {
    Routes = [] 
}

let get path handler app =
    let pattern = "^" + Regex.Escape(path).Replace("\\:", "([^/]+)") + "$"
    let route = Regex(pattern, RegexOptions.IgnoreCase)
    { Routes = (route, handler) :: app.Routes }

let listen url app =
    let processRequest (ctx: HttpListenerContext) =
        async {
            use responseWriter = new StreamWriter(ctx.Response.OutputStream)
            ctx.Response.ContentType <- MediaTypeNames.Text.Html
            let path = ctx.Request.Url.AbsolutePath
            let handler = app.Routes |> List.tryFind (fun (route, _) -> route.IsMatch(path))
            match handler with
            | Some (_, handler) ->
                let response = handler (ctx.Request, ctx.Response)
                fprintf responseWriter "<html><body><p>%s</p></body></html>" response
            | None ->
                ctx.Response.StatusCode <- 404
                fprintf responseWriter "<html><body><p>Not Found</p></body></html>"
        }

    let listener = new HttpListener()
    listener.Prefixes.Add url
    listener.Start()

    let rec loop() =
        async {
            let! ctx = Async.FromBeginEnd(listener.BeginGetContext, listener.EndGetContext)
            Async.Start (processRequest ctx)
            return! loop()
        }

    printfn "Listening on %s" url
    Async.RunSynchronously(loop()) |> ignore