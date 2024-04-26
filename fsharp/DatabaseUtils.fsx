module DatabaseUtils

#r "nuget: Npgsql"
#r "nuget: Newtonsoft.Json"
#r "nuget: MySql.Data"

open Npgsql
open System.Collections.Generic
open Newtonsoft.Json
open MySql.Data.MySqlClient
open System

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

type QueryState = {
    Columns: string list
    Table: string
    Joins: (string * string) list // (join type, table)
    OnConditions: string list
    Conditions: string list
    GroupByColumns: string list
    OrderByConditions: string list
}

type QueryBuilder() =
    member __.Yield(_) = { Columns = []; Table = ""; Joins = []; OnConditions = []; Conditions = []; GroupByColumns = []; OrderByConditions = [] }

    member __.Zero() = { Columns = []; Table = ""; Joins = []; OnConditions = []; Conditions = []; GroupByColumns = []; OrderByConditions = [] }

    [<CustomOperation("select")>]
    member __.Select(state: QueryState, columns) =
        { state with Columns = columns }

    [<CustomOperation("from")>]
    member __.From(state: QueryState, table) =
        { state with Table = table }

    [<CustomOperation("where")>]
    member __.Where(state: QueryState, newConditions) =
        { state with Conditions = state.Conditions @ newConditions |> List.filter (fun x -> x <> "") }

    [<CustomOperation("join")>]
    member __.Join(state: QueryState, joinType, table, onCondition) =
        { state with Joins = state.Joins @ [(joinType, table)]; OnConditions = state.OnConditions @ [onCondition] }

    [<CustomOperation("group_by")>]
    member __.GroupBy(state: QueryState, columns: string list) =
        { state with GroupByColumns = columns }

    [<CustomOperation("order_by")>]
    member __.OrderBy(state: QueryState, conditions: string list) =
        { state with OrderByConditions = conditions }
    
    member __.Bind(state: QueryState, f) =
        f(state)

    member __.Return(state: QueryState) =
        state

    member __.Run(state: QueryState) =
        // failwith if required fields are missing
        if state.Columns = [] then failwith "Columns are required"
        if state.Table = "" then failwith "Table is required"

        let selectClause =
            let columns = String.Join(",\n  ", state.Columns)
            sprintf "SELECT \n  %s \nFROM %s" columns state.Table

        let joinClause query =
            match state.Joins with
            | [] -> query
            | joins ->
                let joinStrings = joins |> List.map (fun (joinType, table) -> sprintf "\n%s JOIN %s" joinType table)
                let onStrings = state.OnConditions |> List.map (fun condition -> sprintf "\nON %s" condition)
                sprintf "\n%s %s %s" query (String.Join(" ", joinStrings)) (String.Join(" ", onStrings))

        let whereClause query =
            match state.Conditions with
            | [] -> query
            | conditions -> sprintf "%s\nWHERE %s" query (String.Join("\nAND ", conditions))

        let groupByClause query =
            match state.GroupByColumns with
            | [] -> query
            | columns -> sprintf "%s\nGROUP BY %s" query (String.Join(", ", columns))

        let orderByClause query =
            match state.OrderByConditions with
            | [] -> query
            | conditions -> sprintf "%s\nORDER BY %s" query (String.Join(", ", conditions))

        // Pipeline the query generation process
        selectClause
        |> joinClause
        |> whereClause
        |> groupByClause
        |> orderByClause
        |> fun query -> sprintf "%s;" query


let queryBuilder = QueryBuilder()

let sql (s: string) = s