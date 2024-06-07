module Excel

#r "nuget: ClosedXML"

open ClosedXML.Excel

let tryLoadWorkbook (filePath: string) =
    try
        let workbook = new XLWorkbook(filePath)
        Ok workbook
    with
    | ex -> Error ex.Message

let tryGetWorksheet (workbook: XLWorkbook) (sheetName: string)  =
    try
        let worksheet = workbook.Worksheet(sheetName)
        if isNull worksheet then None else Some worksheet
    with
    | _ -> None

let tryGetColumnLetter (worksheet: IXLWorksheet) columnName =
    let headers = worksheet.Row(1).CellsUsed() // Assuming the headers are in the first row
    headers 
    |> Seq.tryFind (fun cell -> cell.GetString() = columnName) 
    |> Option.map (fun cell -> cell.Address.ColumnLetter)

let getColumnLetter (worksheet: IXLWorksheet) columnName =
    tryGetColumnLetter worksheet columnName
    |> function
    | Some colLetter -> colLetter
    | None -> failwithf "Column %s not found" columnName

let rowCellValue (row : IXLRow) (columnName : string) =
    let columnLetter = getColumnLetter row.Worksheet columnName
    let cell = row.Cell(columnLetter)
    if cell.HasFormula then
        // Attempt to get the calculated value of the formula
        try cell.CachedValue.ToString()
        with | _ -> ""
    else
        cell.GetValue<string>()
