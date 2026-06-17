using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;

namespace ShowcaseAPI.Hubs
{
    [Authorize(Roles = "Admin")]
    public class ContactHub : Hub
    {
    }
}
