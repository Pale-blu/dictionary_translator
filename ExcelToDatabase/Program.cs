using System;
using System.Collections.Generic;
using System.Data.SqlClient;
using System.IO;
using Dapper;
using OfficeOpenXml;

class Program
{
    static void Main()
    {
        // Path to your Excel file
        string excelFilePath = @"..\Translation_Template.xlsx";

        // SQL Server connection string (adjust as needed)
        // string connectionString = "Server=YOUR_SERVER_NAME;Database=master;User Id=YOUR_USERNAME;Password=YOUR_PASSWORD;";
           string connectionString = "Server=VARUN;Database=master;Trusted_Connection=True;";

        // Step 1: Create Database and Table
        CreateDatabaseAndTable(excelFilePath, connectionString);

        // Step 2: Populate the table from Excel
        PopulateTableFromExcel(excelFilePath, connectionString.Replace("Database=master;", "Database=DictionaryDB;"));

    }

static void CreateDatabaseAndTable(string excelFilePath, string connectionString)
{
    using (var connection = new SqlConnection(connectionString))
    {
        connection.Open();

        // Switch to the new database
        connection.ChangeDatabase("DictionaryDB");

        // Drop the existing table if it exists
        connection.Execute("IF OBJECT_ID('dbo.Dictionary', 'U') IS NOT NULL DROP TABLE dbo.Dictionary;");

        // Read the languages (columns) dynamically from the first row of the Excel file
        List<string> columns = new List<string>();
        using (var package = new ExcelPackage(new FileInfo(excelFilePath)))
        {
            var worksheet = package.Workbook.Worksheets[0];
            int col = 1;
            while (worksheet.Cells[1, col].Value != null)
            {
                columns.Add(worksheet.Cells[1, col].Text.Trim());
                col++;
            }
        }

        // Build SQL statement to create the table with dynamic columns
        string createTableSql = "CREATE TABLE dbo.Dictionary (Id INT PRIMARY KEY IDENTITY(1,1), ";
        for (int i = 0; i < columns.Count; i++)
        {
            // Use NVARCHAR(MAX) for large text columns like English
            string columnType = columns[i] == "English" ? "NVARCHAR(MAX)" : "NVARCHAR(MAX)";
            createTableSql += $"{columns[i]} {columnType}";
            if (i < columns.Count - 1)
                createTableSql += ", ";
        }
        createTableSql += ");";

        // Execute the command to create the table
        connection.Execute(createTableSql);

        Console.WriteLine("Table recreated successfully with dynamic columns.");
    }
}



    static void PopulateTableFromExcel(string filePath, string connectionString)
{
    ExcelPackage.LicenseContext = LicenseContext.NonCommercial;

    using (var package = new ExcelPackage(new FileInfo(filePath)))
    using (var connection = new SqlConnection(connectionString))
    {
        connection.Open();
        var worksheet = package.Workbook.Worksheets[0];

        // Get column names from the first row
        List<string> columns = new List<string>();
        int col = 1;
        while (worksheet.Cells[1, col].Value != null)
        {
            columns.Add(worksheet.Cells[1, col].Text.Trim());
            col++;
        }

        // Iterate through rows starting from the second row
        int row = 2;
        while (worksheet.Cells[row, 1].Value != null)
        {
            var values = new Dictionary<string, object>();
            for (int i = 0; i < columns.Count; i++)
            {
                // Add data for each column, using DBNull for empty cells
                var cellValue = worksheet.Cells[row, i + 1].Value;
                values[columns[i]] = cellValue == null ? DBNull.Value : cellValue.ToString();
            }

            // Generate dynamic SQL insert command
            var columnNames = string.Join(", ", columns);  // Columns for the INSERT query
            var parameterNames = string.Join(", ", columns.ConvertAll(c => "@" + c));  // Corresponding parameters
            var insertSql = $"INSERT INTO Dictionary ({columnNames}) VALUES ({parameterNames});";

            // Execute the insert command with the corresponding values
            connection.Execute(insertSql, values);
            Console.WriteLine($"Inserted row {row - 1} successfully.");
            row++;
        }

        Console.WriteLine("Data populated successfully.");
    }
}

}
