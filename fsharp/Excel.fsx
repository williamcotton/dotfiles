module Excel

#r "nuget: ExcelDataReader"
#r "nuget: ExcelDataReader.DataSet"
#r "nuget: FsExcel"
#r "nuget: CsvHelper"

open System.IO
open ExcelDataReader
open System.Text
open CsvHelper
open FsExcel
open System.Globalization

let excelToCsv (excelFilePath: string) =
    use stream = File.Open(excelFilePath, FileMode.Open, FileAccess.Read)
    use reader = ExcelReaderFactory.CreateReader(stream)

    let dataSet = reader.AsDataSet()
    let table = dataSet.Tables.[0]

    let csvStringBuilder = StringBuilder()
    use csvWriter = new CsvWriter(new StringWriter(csvStringBuilder), CultureInfo.InvariantCulture)

    for row in table.Rows do
        for i in 0 .. table.Columns.Count - 1 do
            csvWriter.WriteField(row.[i].ToString()) |> ignore
        csvWriter.NextRecord() |> ignore

    Ok (csvStringBuilder.ToString())

let csvToExcel (csvFilePath: string, excelFilePath: string) =
    // Create the Excel file
    use spreadsheetDocument = SpreadsheetDocument.Create(excelFilePath, SpreadsheetDocumentType.Workbook)
    let workbookPart = spreadsheetDocument.AddWorkbookPart()
    workbookPart.Workbook <- new Workbook()
    let worksheetPart = workbookPart.AddNewPart<WorksheetPart>()
    worksheetPart.Worksheet <- new Worksheet(new SheetData())
    let sheets = spreadsheetDocument.WorkbookPart.Workbook.AppendChild<Sheets>(new Sheets())

    // Create a sheet
    let sheet = new Sheet { Id = spreadsheetDocument.WorkbookPart.GetIdOfPart(worksheetPart), SheetId = 1, Name = "Sheet 1" }
    sheets.Append(sheet)
    workbookPart.Workbook.Save()

    let sheetData = worksheetPart.Worksheet.GetFirstChild<SheetData>()

    // Read CSV file and write to Excel
    use reader = new StreamReader(csvFilePath)
    use csvReader = new CsvReader(reader, CultureInfo.InvariantCulture)

    let records = csvReader.GetRecords<dynamic>() |> Seq.toList
    for record in records do
        let row = new Row()
        sheetData.AppendChild(row)
        for (field, _) in record do
            let cell = new Cell { CellValue = new CellValue(field.ToString()), DataType = CellValues.String }
            row.AppendChild(cell)

    // Save the changes to the worksheet part
    worksheetPart.Worksheet.Save()

    Ok "CSV converted to Excel successfully"