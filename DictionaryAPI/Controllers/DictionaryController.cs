using Microsoft.AspNetCore.Mvc;
using System.Linq;
using Microsoft.Data.SqlClient;
using Dapper;
using System.Collections.Generic;

namespace DictionaryApi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class DictionaryController : ControllerBase
    {
        private readonly string _connectionString = "Server=VARUN;Database=DictionaryDB;Trusted_Connection=True;TrustServerCertificate=True;";

        [HttpPost("translate")]
        public IActionResult Translate([FromBody] TranslationRequest request)
        {
            try
            {
                // Validate input
                if (string.IsNullOrEmpty(request.InputWord) || string.IsNullOrEmpty(request.InputLanguage) || string.IsNullOrEmpty(request.OutputLanguage))
                {
                    return BadRequest("All fields (inputWord, inputLanguage, outputLanguage) are required.");
                }

                // Get translation
                var translation = GetTranslation(request.InputWord, request.InputLanguage, request.OutputLanguage);
                if (string.IsNullOrEmpty(translation))
                {
                    return NotFound("Translation not found.");
                }

                // Return response
                return Ok(new { translation });
            }
            catch (SqlException ex)
            {
                return StatusCode(500, $"Database error: {ex.Message}");
            }
        }

        private string GetTranslation(string inputWord, string inputLanguage, string outputLanguage)
        {
            using (var connection = new SqlConnection(_connectionString))
            {
                connection.Open();

                // Dynamic SQL query to retrieve translation based on input word and languages
                var query = $@"
                    SELECT {outputLanguage}
                    FROM Dictionary
                    WHERE {inputLanguage} = @InputWord";

                // Execute the query and get the result
                var result = connection.Query<string>(query, new { InputWord = inputWord }).FirstOrDefault();

                return result;
            }
        }

        // New endpoint to get the list of languages
        [HttpGet("languages")]
        public IActionResult GetLanguages()
        {
            var languages = new List<string>();
            try
            {
                using (var connection = new SqlConnection(_connectionString))
                {
                    connection.Open();
                    using (var command = new SqlCommand("SELECT TOP 1 * FROM Dictionary", connection))
                    {
                        using (var reader = command.ExecuteReader())
                        {
                            if (reader.Read())
                            {
                                // Get the column names (skip the first column if it’s the primary key)
                                for (int i = 1; i < reader.FieldCount; i++)
                                {
                                    languages.Add(reader.GetName(i));
                                }
                            }
                        }
                    }
                }
                return Ok(languages);
            }
            catch (SqlException ex)
            {
                return StatusCode(500, $"Database error: {ex.Message}");
            }
        }
    }

    public class TranslationRequest
    {
        public string InputWord { get; set; }
        public string InputLanguage { get; set; }
        public string OutputLanguage { get; set; }
    }
}
