using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using WhatsOnTap.Models;
using Microsoft.AspNetCore.Mvc;

namespace WhatsOnTap.Controllers
{
    [Route("api/[controller]")]
    public class BeerController : Controller
    {
        private readonly WhatsOnTapContext _context;

        public BeerController(WhatsOnTapContext context)
        {
            _context = context;
        }

        [HttpGet]
        public IEnumerable<Beer> GetAll()
        {
            return _context.Beer.ToList();
        }

        [HttpGet("{id}")]
        public IActionResult GetById(long id)
        {
            var item = _context.Beer.FirstOrDefault(t => t.id == id);
            if (item == null)
            {
                return NotFound();
            }
            return new ObjectResult(item);
        }
        
        [HttpPost]
        public IActionResult Create([FromBody] Beer item)
        {
            if (item == null)
            {
                return BadRequest();
            }
            _context.Beer.Add(new Beer
            {
                name = item.name
            });
            _context.SaveChanges();

            return Ok( new { message= "Beer added successfully."});
        }

        [HttpPut("{id}")]
        public IActionResult Update(long id, [FromBody] Beer item)
        {
            if (item == null || id == 0)
            {
                return BadRequest();
            }

            var beer = _context.Beer.FirstOrDefault(t => t.id == id);
            if (beer == null)
            {
                return NotFound();
            }

            beer.name = item.name;

            _context.Beer.Update(beer);
            _context.SaveChanges();
            return Ok( new { message= "Beer is updated successfully."});
        }

        [HttpDelete("{id}")]
        public IActionResult Delete(long id)
        {
            var beer = _context.Beer.FirstOrDefault(t => t.id == id);
            if (beer == null)
            {
                return NotFound();
            }

            _context.Beer.Remove(beer);
            _context.SaveChanges();
            return Ok( new { message= "Beer is deleted successfully."});
        }
    }
}