#!/usr/bin/env dotnet fsi

#r "nuget: Markdig"

open Markdig

Markdown.ToHtml("<div id='test'>Hello **world**!</div>")
  |> printfn "%s"