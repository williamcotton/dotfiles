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
    match results with
    | Ok r -> Ok (convertToJsonBase r)
    | Error e -> Error e

let convertToCsvBase (results: List<Dictionary<string, obj>>) =
    let csv = new System.Text.StringBuilder()
    let headers = results.[0].Keys
    csv.AppendLine(String.concat "," headers) |> ignore
    for row in results do
        let values = headers |> Seq.map (fun h -> row.[h].ToString())
        csv.AppendLine(String.concat "," values) |> ignore
    csv.ToString()

let convertToCsv results =
    match results with
    | Ok r -> Ok (convertToCsvBase r)
    | Error e -> Error e

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
    match results with
    | Ok r -> Ok (convertToHtmlBase r)
    | Error e -> Error e

let connectToPostgresDatabaseBase connectionString =
    let connection = new NpgsqlConnection(connectionString)
    connection.Open()
    connection

let connectToPostgresDatabase connectionString =
    match connectionString with
    | Ok c -> Ok (connectToPostgresDatabaseBase c)
    | Error e -> Error e

let executePostgresQueryBase query connection =
    let command = new NpgsqlCommand(query, connection)
    (command.ExecuteReader() :?> NpgsqlDataReader)

let executePostgresQuery query connection =
    match connection with
    | Ok c -> Ok (executePostgresQueryBase query c)
    | Error e -> Error e

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
    match reader with
    | Ok r -> Ok (readPostgresResultsBase r)
    | Error e -> Error e

let connectToMysqlDatabaseBase connectionString =
    let connection = new MySqlConnection(connectionString)
    connection.Open()
    connection

let connectToMysqlDatabase connectionString =
    match connectionString with
    | Ok c -> Ok (connectToMysqlDatabaseBase c)
    | Error e -> Error e

let executeMysqlQueryBase query connection =
    let command = new MySqlCommand(query, connection)
    command.CommandTimeout <- 360
    command.ExecuteReader()

let executeMysqlQuery query connection =
    match connection with
    | Ok c -> Ok (executeMysqlQueryBase query c)
    | Error e -> Error e

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
    match reader with
    | Ok r -> Ok (readMysqlResultsBase r)
    | Error e -> Error e
