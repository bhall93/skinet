using System.Threading.Tasks;
using Core.Entities;
using Core.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using API.Errors;
using System.IO;
using Order = Core.OrderAggregate.Order;
using Microsoft.Extensions.Logging;

namespace API.Controllers
{
  public class PaymentsController : BaseApiController
  {
    private readonly IPaymentService _paymentService;
    private const string WhSecret = "whsec_jA2U56GhcYv7CxiDUpoi0oyAKiXhSFoI";
    private readonly ILogger<IPaymentService> _logger;

    public PaymentsController(IPaymentService paymentService, ILogger<IPaymentService> logger)
    {
      _logger = logger;
      _paymentService = paymentService;
    }

    [Authorize]
    [HttpPost("{basketId}")]
    public async Task<ActionResult<CustomerBasket>> CreateOrUpdatePaymentIntent(string basketId)
    {
      var basket = await _paymentService.CreateOrUpdatePaymentIntent(basketId);

      if (basket == null) return BadRequest(new ApiResponse(400, "Problem with your basket"));

      return basket;
    }

    [HttpPost("webhook")]
    public async Task<ActionResult> StripeWebhook()
    {
      var json = await new StreamReader(HttpContext.Request.Body).ReadToEndAsync();

      var stripeEvent = Stripe.EventUtility.ConstructEvent(json, Request.Headers["Stripe-Signature"], WhSecret);

      Stripe.PaymentIntent intent;
      Order order;

      switch (stripeEvent.Type)
      {
        case "payment_intent.succeeded":
          intent = (Stripe.PaymentIntent) stripeEvent.Data.Object;
          _logger.LogInformation("Payment Succeeded: ", intent.Id);
          order = await _paymentService.UpdateOrderPaymentSucceeded(intent.Id);
          _logger.LogInformation("Order updated to payment reeived");
          break;
        
        case "payment_intent.payment_failed":
          intent = (Stripe.PaymentIntent) stripeEvent.Data.Object;
          _logger.LogInformation("Payment Failed: ", intent.Id);
          order = await _paymentService.UpdateOrderPaymentFailed(intent.Id);
          _logger.LogInformation("Payment Failed: ");
          break;
      }

      return new EmptyResult();

    }
  }
}