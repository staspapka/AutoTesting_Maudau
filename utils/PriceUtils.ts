export class PriceUtils {
  static clean(priceText: string): number {
    return parseInt(priceText.replace(/[^0-9]/g, ''));
  }
}
