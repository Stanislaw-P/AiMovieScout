using Microsoft.AspNetCore.Mvc;

namespace AiMovieScout.Controllers
{
    public class AccountController : Controller
    {
        public IActionResult Index()
        {
            return View();
        }
    }
}
