using Microsoft.AspNetCore.Mvc;
using System.DirectoryServices.Protocols; // Untuk LDAP
using System.Net;                       // Untuk LDAP
using System.Text.Json;                 // Untuk OAuth

namespace SimpleAuthApi.Controllers
{

    public record LoginRequest(string Username, string Password);
    public record GoogleCallbackRequest(string Code);

    [ApiController]
    [Route("api/auth")]
    public class AuthController : ControllerBase
    {
        private readonly IHttpClientFactory _httpClientFactory;
        public AuthController(IHttpClientFactory httpClientFactory)
        {
            _httpClientFactory = httpClientFactory;
        }

        [HttpPost("ldap-login")]
        public IActionResult LdapLogin([FromBody] LoginRequest request)
        {
            try
            {
               
                string ldapServer = "ldap.kampus-anda.ac.id";
                var connection = new LdapConnection(ldapServer);
                
                
                var credentials = new NetworkCredential(request.Username, request.Password);
                
                connection.Bind(credentials); 

                // Jika sukses (tidak error), login berhasil
                return Ok(new { message = $"Login LDAP {request.Username} berhasil!" });
            }
            catch (LdapException)
            {
                // Jika error, username/password salah
                return Unauthorized(new { message = "Login LDAP gagal: Kredensial salah." });
            }
        }

        // --- 2. ENDPOINT LOGIN OAUTH (GOOGLE) SEDERHANA ---
        [HttpPost("google-login")]
        public async Task<IActionResult> GoogleLogin([FromBody] GoogleCallbackRequest request)
        {
            // RAHASIA: Ganti dengan info Anda dari Google Cloud Console
            string CLIENT_ID = "ID_CLIENT_GOOGLE_ANDA.apps.googleusercontent.com";
            string CLIENT_SECRET = "RAHASIA_CLIENT_GOOGLE_ANDA";
            string REDIRECT_URI = "http://localhost:3000"; // Halaman utama React kita

            // Menukar 'code' dengan 'access_token'
            var client = _httpClientFactory.CreateClient();
            var tokenRequestData = new Dictionary<string, string>
            {
                { "code", request.Code },
                { "client_id", CLIENT_ID },
                { "client_secret", CLIENT_SECRET },
                { "redirect_uri", REDIRECT_URI },
                { "grant_type", "authorization_code" }
            };

            var response = await client.PostAsync("https://oauth2.googleapis.com/token", 
                                                  new FormUrlEncodedContent(tokenRequestData));

            if (!response.IsSuccessStatusCode)
            {
                return BadRequest(new { message = "Gagal menukar kode." });
            }

            var json = await response.Content.ReadAsStringAsync();
            // var tokenResponse = JsonSerializer.Deserialize<JsonElement>(json);
            // var accessToken = tokenResponse.GetProperty("access_token").GetString();

            // Di sini kita sudah berhasil!
            // Kita bisa pakai 'accessToken' untuk ambil info user, dll.
            return Ok(new { message = "Login Google berhasil!", responseData = json });
        }
    }
}