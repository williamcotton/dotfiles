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