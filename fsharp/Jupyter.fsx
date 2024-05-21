module Jupyter

type DisplayHelpers = {
    displayImage64: string -> unit
}

let displayHelpers display html =
  let base64ToHtmlImage (base64Img) =
      $"<img src=\"data:image/png;base64,{base64Img}\" style=\"width: 500px\"/>" 
  let displayImage64 base64String =
    display(html(base64ToHtmlImage base64String)) |> ignore

  { 
    displayImage64 = displayImage64
  }

