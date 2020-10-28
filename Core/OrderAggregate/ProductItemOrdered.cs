namespace Core.OrderAggregate
{
    // Used to take a snapshot of what was ordered, in case the product changes in the future
    public class ProductItemOrdered
    {
      public int ProductItemId { get; set; }
      public string Name { get; set; }
      public string PictureUrl { get; set; }
      
      public ProductItemOrdered()
      {
      }

      public ProductItemOrdered(int productItemId, string name, string pictureUrl)
      {
        ProductItemId = productItemId;
        Name = name;
        PictureUrl = pictureUrl;
      }
    }
}