module DatabaseUtils

#r "nuget: Npgsql"
#r "nuget: Newtonsoft.Json"

open Npgsql
open System.Collections.Generic
open Newtonsoft.Json

let connectToDatabaseBase connectionString =
    let connection = new NpgsqlConnection(connectionString)
    connection.Open()
    connection

let connectToDatabase connectionString =
    match connectionString with
    | Ok c -> Ok (connectToDatabaseBase c)
    | Error e -> Error e

let executeQueryBase query connection =
    let command = new NpgsqlCommand(query, connection)
    (command.ExecuteReader() :?> NpgsqlDataReader)

let executeQuery query connection =
    match connection with
    | Ok c -> Ok (executeQueryBase query c)
    | Error e -> Error e

let readResultsBase (reader: NpgsqlDataReader) =
    let results = new List<Dictionary<string, obj>>()
    while reader.Read() do
        let row = new Dictionary<string, obj>()
        for i in 0 .. reader.FieldCount - 1 do
            row.[reader.GetName(i)] <- reader.GetValue(i)
        results.Add(row)
    results

let readResults reader =
    match reader with
    | Ok r -> Ok (readResultsBase r)
    | Error e -> Error e

let convertToJsonBase results =
    (JsonConvert.SerializeObject(results, Formatting.Indented))

let convertToJson results =
    match results with
    | Ok r -> Ok (convertToJsonBase r)
    | Error e -> Error e