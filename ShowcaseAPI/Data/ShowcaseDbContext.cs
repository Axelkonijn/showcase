using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using ShowcaseAPI.Models;

namespace ShowcaseAPI.Data
{
    public class ShowcaseDbContext : IdentityDbContext<ApplicationUser>
    {
        public ShowcaseDbContext(DbContextOptions<ShowcaseDbContext> options)
            : base(options)
        {
        }

        public DbSet<ContactMessage> ContactMessages { get; set; }
        public DbSet<GlobalSettings> GlobalSettings { get; set; }

        protected override void OnModelCreating(ModelBuilder builder)
        {
            base.OnModelCreating(builder);

            builder.Entity<ContactMessage>().ToTable("ContactMessages");
        }
    }
}