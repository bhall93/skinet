using System.Threading.Tasks;
using Core.Entities;
using Core.OrderAggregate;
using Core.Interfaces;
using Core.Specifications;
using Order = Core.OrderAggregate.Order;
using Microsoft.Extensions.Configuration;
using Stripe;
using Product = Core.Entities.Product;
using System.Linq;
using System.Collections.Generic;

namespace Infrastructure.Services
{
  public class PaymentService : IPaymentService
  {
    private readonly IBasketRepository _basketRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly IConfiguration _config;

    public PaymentService(
        IBasketRepository basketRepository, 
        IUnitOfWork unitOfWork, 
        IConfiguration config)
    {
      _basketRepository = basketRepository;
      _unitOfWork = unitOfWork;
      _config = config;
    }

    public async Task<CustomerBasket> CreateOrUpdatePaymentIntent(string basketId)
    {
      Stripe.StripeConfiguration.ApiKey = _config["StripeSettings:SecretKey"];

      var basket = await _basketRepository.GetBasketAsync(basketId);

      if (basket == null) return null;

      // Get the delivery cost
      if (basket.DeliveryMethodId.HasValue)
      {
        var DeliveryMethod = await _unitOfWork.Repository<DeliveryMethod>()
          .GetByIdAsync((int)basket.DeliveryMethodId);
        
        basket.Shipping = DeliveryMethod.Price;
      }

      // Verify that the prices for the products match what is on server
      foreach (var item in basket.Items)
      {
        var productItem = await _unitOfWork.Repository<Product>().GetByIdAsync(item.Id);
        if (item.Price != productItem.Price)
        {
          item.Price = productItem.Price;
        }
      }

      var service = new Stripe.PaymentIntentService();
      Stripe.PaymentIntent intent;

      // Convert decimals amounts to longs for use with stripe
      var subtotal = (long) basket.Items.Sum(i => i.Quantity * (i.Price * 100));
      var shippingPriceLong = (long) basket.Shipping * 100;

      // Create new payment intent
      if (string.IsNullOrEmpty(basket.PaymentIntentId))
      {
        var options = new Stripe.PaymentIntentCreateOptions
        {
          Amount =  subtotal + shippingPriceLong,
          Currency = "usd",
          PaymentMethodTypes = new List<string> {"card"}
        };

        intent = await service.CreateAsync(options);
        basket.PaymentIntentId = intent.Id;
        basket.ClientSecret = intent.ClientSecret;
      }
      // Update existing payment intent
      else
      {
        var options = new PaymentIntentUpdateOptions
        {
          Amount =  subtotal + shippingPriceLong
        };
        await service.UpdateAsync(basket.PaymentIntentId, options);
      }

      await _basketRepository.UpdateBasketAsync(basket);

      return basket;
    }

    public async Task<Order> UpdateOrderPaymentFailed(string paymentIntentId)
    {
      var spec = new OrderByPaymentIntentIdSpecification(paymentIntentId);
      var order = await _unitOfWork.Repository<Order>().GetEntityWithSpec(spec);

      if (order == null) return null;

      order.Status = OrderStatus.PaymentFailed;
      await _unitOfWork.Complete();

      return order;
    }

    public async Task<Order> UpdateOrderPaymentSucceeded(string paymentIntentId)
    {
      var spec = new OrderByPaymentIntentIdSpecification(paymentIntentId);
      var order = await _unitOfWork.Repository<Order>().GetEntityWithSpec(spec);

      if (order == null) return null;

      order.Status = OrderStatus.PaymentReceived;
      _unitOfWork.Repository<Order>().Update(order);

      await _unitOfWork.Complete();

      return order;

    }
  }
}