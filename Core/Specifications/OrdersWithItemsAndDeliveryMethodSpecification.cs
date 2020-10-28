using System;
using System.Linq.Expressions;
using Core.OrderAggregate;

namespace Core.Specifications
{
  public class OrdersWithItemsAndDeliveryMethodSpecification : BaseSpecification<Order>
  {
    public OrdersWithItemsAndDeliveryMethodSpecification(string email) : base(o => o.BuyerEmail == email)
    {
        AddInclude(o => o.OrderItems);
        AddInclude(o => o.DeliveryMethod);
        AddOrderByDescending(o => o.OrderDate);
    }

    public OrdersWithItemsAndDeliveryMethodSpecification(int id, string email) 
        : base(o => o.Id == id && o.BuyerEmail == email)
    {
        AddInclude(o => o.OrderItems);
        AddInclude(o => o.DeliveryMethod);
    }
  }
}