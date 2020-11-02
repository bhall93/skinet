using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Core.Entities;
using Core.Interfaces;
using Core.OrderAggregate;
using Core.Specifications;

namespace Infrastructure.Services
{
  public class OrderService : IOrderService
  {
    private readonly IBasketRepository _basketRepo;
    private readonly IUnitOfWork _unitOfWork;
    private readonly IPaymentService _paymentService;

    public OrderService(IBasketRepository basketRepo, IUnitOfWork unitOfWork, IPaymentService paymentService)
    {
      _paymentService = paymentService;
      _unitOfWork = unitOfWork;
      _basketRepo = basketRepo;
    }

    public async Task<Order> CreateOrderAsync(string buyerEmail, int deliveryMethodId, string basketId, Address shippingAddress)
    {
      // get basket from repo
      var basket = await _basketRepo.GetBasketAsync(basketId);

      // get items from product repo to validate that the prices are correct, then create a list of order items
      var orderItems = new List<OrderItem>();
      foreach (var item in basket.Items)
      {
        var productItem = await _unitOfWork.Repository<Product>().GetByIdAsync(item.Id);
        var itemOrdered = new ProductItemOrdered(productItem.Id, productItem.Name, productItem.PictureUrl);
        var orderItem = new OrderItem(itemOrdered, productItem.Price, item.Quantity);
        orderItems.Add(orderItem);
      }

      // get delivery method from repo
      var deliveryMethod = await _unitOfWork.Repository<DeliveryMethod>().GetByIdAsync(deliveryMethodId);

      // calc subtotal
      var subtotal = orderItems.Sum(i => i.Price * i.Quantity);

      // check for existing order
      var spec = new OrderByPaymentIntentIdSpecification(basket.PaymentIntentId);
      var existingOrder = await _unitOfWork.Repository<Order>().GetEntityWithSpec(spec);

      if (existingOrder != null)
      {
        _unitOfWork.Repository<Order>().Delete(existingOrder);
        await _paymentService.CreateOrUpdatePaymentIntent(basket.PaymentIntentId);
      }

      // create order
      var order = new Order(orderItems, buyerEmail, shippingAddress, deliveryMethod, subtotal, basket.PaymentIntentId);
      _unitOfWork.Repository<Order>().Add(order);

      // TODO save to db
      var result = await _unitOfWork.Complete();
      
      if (result <= 0)
      {
        return null;
      }

      // return order
      return order;
    }

    public async Task<IReadOnlyList<DeliveryMethod>> GetDeliveryMethodsAsync()
    {
      return await _unitOfWork.Repository<DeliveryMethod>().ListAllAsync();
    }

    public async Task<Order> GetOrderByIdAsync(int id, string buyerEmail)
    {
      var spec = new OrdersWithItemsAndDeliveryMethodSpecification(id, buyerEmail);
      return await _unitOfWork.Repository<Order>().GetEntityWithSpec(spec);
    }

    public async Task<IReadOnlyList<Order>> GetOrdersForUserAsync(string buyerEmail)
    {
      var spec = new OrdersWithItemsAndDeliveryMethodSpecification(buyerEmail);
      return await _unitOfWork.Repository<Order>().ListAsync(spec);
    }
  }
}