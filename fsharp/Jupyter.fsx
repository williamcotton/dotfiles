module Jupyter

type DisplayHelpers = {
    displayImage64: string -> unit
    pltDisplay: (string -> Result<string, string>) -> string -> unit
}

let displayHelpers display html =
  let base64ToHtmlImage (base64Img) =
      $"<img src=\"data:image/png;base64,{base64Img}\" />" 
  let displayImage64 base64String =
    display(html(base64ToHtmlImage base64String)) |> ignore

  let pltDisplay plt64 plt = 
      plt
      |> plt64
      |> function
          | Ok image64 -> displayImage64 image64
          | Error e -> display(e) |> ignore

  { 
    displayImage64 = displayImage64
    pltDisplay = pltDisplay
  }

