module DatabaseUtils

#r "nuget: Npgsql"
#r "nuget: Newtonsoft.Json"
#r "nuget: MySql.Data"

open Npgsql
open System.Collections.Generic
open Newtonsoft.Json
open MySql.Data.MySqlClient

let convertToJsonBase results =
    (JsonConvert.SerializeObject(results, Formatting.Indented))

let convertToJson results =
    Result.map convertToJsonBase results

let convertToCsvBase (results: List<Dictionary<string, obj>>) =
    let csv = new System.Text.StringBuilder()
    let headers = results.[0].Keys
    csv.AppendLine(String.concat "," headers) |> ignore
    for row in results do
        let values = headers |> Seq.map (fun h -> row.[h].ToString())
        csv.AppendLine(String.concat "," values) |> ignore
    csv.ToString()

let convertToCsv results =
    Result.map convertToCsvBase results

let convertToHtmlBase (results: List<Dictionary<string, obj>>) =
    let html = new System.Text.StringBuilder()
    html.AppendLine("<table>") |> ignore
    html.AppendLine("<thead><tr>") |> ignore
    // Assuming all dictionaries have the same keys
    let headers = results.[0].Keys
    for header in headers do
        html.AppendFormat("<th>{0}</th>", header) |> ignore
    html.AppendLine("</tr></thead>") |> ignore
    html.AppendLine("<tbody>") |> ignore
    for row in results do
        html.AppendLine("<tr>") |> ignore
        for header in headers do
            let value = match row.TryGetValue(header) with
                        | (true, v) when v <> null -> v.ToString()
                        | _ -> ""
            html.AppendFormat("<td>{0}</td>", value) |> ignore
        html.AppendLine("</tr>") |> ignore
    html.AppendLine("</tbody>") |> ignore
    html.AppendLine("</table>") |> ignore
    html.ToString()

let convertToHtml results =
    Result.map convertToHtmlBase results

let connectToPostgresDatabaseBase connectionString =
    let connection = new NpgsqlConnection(connectionString)
    connection.Open()
    connection

let connectToPostgresDatabase connectionString =
    Result.map connectToPostgresDatabaseBase connectionString

let executePostgresQueryBase query connection =
    let command = new NpgsqlCommand(query, connection)
    (command.ExecuteReader() :?> NpgsqlDataReader)

let executePostgresQuery query connection =
    Result.map (fun c -> executePostgresQueryBase query c) connection

let readPostgresResultsBase (reader: NpgsqlDataReader) =
    let results = new List<Dictionary<string, obj>>()
    while reader.Read() do
        let row = new Dictionary<string, obj>()
        for i in 0 .. reader.FieldCount - 1 do
            row.[reader.GetName(i)] <- reader.GetValue(i)
        results.Add(row)
    reader.Close()
    results

let readPostgresResults reader =
    Result.map readPostgresResultsBase reader

let connectToMysqlDatabaseBase connectionString =
    let connection = new MySqlConnection(connectionString)
    connection.Open()
    connection

let connectToMysqlDatabase connectionString =
    Result.map connectToMysqlDatabaseBase connectionString

let executeMysqlQueryBase query connection =
    let command = new MySqlCommand(query, connection)
    command.CommandTimeout <- 360
    command.ExecuteReader()

let executeMysqlQuery query connection =
    Result.map (fun c -> executeMysqlQueryBase query c) connection

let readMysqlResultsBase (reader: MySqlDataReader) =
    let results = new List<Dictionary<string, obj>>()
    while reader.Read() do
        let row = new Dictionary<string, obj>()
        for i in 0 .. reader.FieldCount - 1 do
            row.[reader.GetName(i)] <- reader.GetValue(i)
        results.Add(row)
    reader.Close()
    results
    

let readMysqlResults reader =
    Result.map readMysqlResultsBase reader

let readMysqlResultsSeqBase (reader: MySqlDataReader) =
    seq {
        try
            while reader.Read() do
                let row = new Dictionary<string, obj>()
                for i in 0 .. reader.FieldCount - 1 do
                    row.[reader.GetName(i)] <- reader.GetValue(i)
                yield row
        finally
            reader.Close()
    }

let readMysqlResultsSeq reader =
    Result.map readMysqlResultsSeqBase reader

let executeMysqlQueryAndReadResultsBase connectionString query =
    use connection = new MySqlConnection(connectionString)
    connection.Open()

    use command = new MySqlCommand(query, connection)
    command.CommandTimeout <- 360

    use reader = command.ExecuteReader()

    let results = new List<Dictionary<string, obj>>()
    while reader.Read() do
        let row = new Dictionary<string, obj>()
        for i in 0 .. reader.FieldCount - 1 do
            row.[reader.GetName(i)] <- reader.GetValue(i)
        results.Add(row)

    results // Return the results

let executeMysqlQueryAndReadResults connectionString query =
    Result.map (executeMysqlQueryAndReadResultsBase connectionString) query

let sql (s: string) = s